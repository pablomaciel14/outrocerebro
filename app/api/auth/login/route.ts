import { env } from "cloudflare:workers";
import { eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { loginAttempts } from "../../../../db/schema";
import { createPersonalSessionCookie } from "../../../personal-auth";
import { readLimitedJson, rejectCrossSiteMutation, sha256 } from "../../../security";

export const dynamic = "force-dynamic";
const runtimeEnv = env as unknown as { AUTHORIZED_EMAIL?: string; SUPABASE_URL?: string; SUPABASE_PUBLISHABLE_KEY?: string };
const ATTEMPT_WINDOW_SECONDS = 15 * 60;
const BLOCK_SECONDS = 15 * 60;
const MAX_FAILURES = 5;

async function attemptKey(request: Request) {
  const ip = request.headers.get("cf-connecting-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  return sha256(`personal-login:${ip}`);
}

async function blockedResponse(key: string, now: number) {
  const [attempt] = await getDb().select().from(loginAttempts).where(eq(loginAttempts.key, key)).limit(1);
  if (!attempt || attempt.blockedUntil <= now) return null;
  const retryAfter = Math.max(1, attempt.blockedUntil - now);
  return Response.json({ error: "Muitas tentativas. Aguarde alguns minutos e tente novamente." }, { status: 429, headers: { "cache-control": "no-store", "retry-after": String(retryAfter) } });
}

async function recordFailure(key: string, now: number) {
  const [previous] = await getDb().select().from(loginAttempts).where(eq(loginAttempts.key, key)).limit(1);
  const inWindow = Boolean(previous && now - previous.windowStartedAt < ATTEMPT_WINDOW_SECONDS);
  const failures = inWindow ? previous!.failures + 1 : 1;
  const values = { key, failures, windowStartedAt: inWindow ? previous!.windowStartedAt : now, blockedUntil: failures >= MAX_FAILURES ? now + BLOCK_SECONDS : 0, updatedAt: now };
  await getDb().insert(loginAttempts).values(values).onConflictDoUpdate({ target: loginAttempts.key, set: values });
}

export async function POST(request: Request) {
  const rejected = rejectCrossSiteMutation(request);
  if (rejected) return rejected;
  const payload = await readLimitedJson<{ email?: string; password?: string }>(request, 4096);
  const email = payload?.email?.trim().toLowerCase() ?? "";
  const password = payload?.password ?? "";
  const authorizedEmail = runtimeEnv.AUTHORIZED_EMAIL?.toLowerCase();
  const supabaseUrl = runtimeEnv.SUPABASE_URL;
  const publishableKey = runtimeEnv.SUPABASE_PUBLISHABLE_KEY;

  if (!authorizedEmail || !supabaseUrl || !publishableKey) return Response.json({ error: "Autenticação indisponível." }, { status: 503, headers: { "cache-control": "no-store" } });
  const key = await attemptKey(request);
  const now = Math.floor(Date.now() / 1000);
  const blocked = await blockedResponse(key, now);
  if (blocked) return blocked;
  if (email !== authorizedEmail || !password || password.length > 512) {
    await recordFailure(key, now);
    return Response.json({ error: "E-mail ou senha incorretos." }, { status: 401, headers: { "cache-control": "no-store" } });
  }

  let response: Response;
  try {
    response = await fetch(`${supabaseUrl.replace(/\/$/, "")}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: { apikey: publishableKey, "content-type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
  } catch {
    return Response.json({ error: "Autenticação temporariamente indisponível." }, { status: 503, headers: { "cache-control": "no-store", "retry-after": "30" } });
  }
  if (!response.ok) {
    await recordFailure(key, now);
    return Response.json({ error: "E-mail ou senha incorretos." }, { status: 401, headers: { "cache-control": "no-store" } });
  }

  const result = await response.json() as { user?: { id?: string; email?: string } };
  if (!result.user?.id || result.user.email?.toLowerCase() !== authorizedEmail) {
    await recordFailure(key, now);
    return Response.json({ error: "Acesso não autorizado." }, { status: 403, headers: { "cache-control": "no-store" } });
  }

  await getDb().delete(loginAttempts).where(eq(loginAttempts.key, key));
  return Response.json({ ok: true }, { headers: { "set-cookie": await createPersonalSessionCookie(email, result.user.id), "cache-control": "no-store" } });
}
