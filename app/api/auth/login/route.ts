import { eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { loginAttempts } from "../../../../db/schema";
import { createPersonalSessionCookie } from "../../../personal-auth";
import { isBlocked, nextFailureState } from "../../../login-throttle";
import { readLimitedJson, rejectCrossSiteMutation, sha256 } from "../../../security";

export const dynamic = "force-dynamic";

const AUTHORIZED_EMAIL = (process.env.AUTHORIZED_EMAIL || "pablo@outrocerebro.com.br").toLowerCase();
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY;

async function attemptKey(request: Request) {
  const ip = request.headers.get("cf-connecting-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  return sha256(`personal-login:${ip}`);
}

async function blockedResponse(key: string, now: number) {
  try {
    const [attempt] = await getDb().select().from(loginAttempts).where(eq(loginAttempts.key, key)).limit(1);
    const result = isBlocked(attempt, now);
    if (!result.blocked) return null;
    return Response.json({ error: "Muitas tentativas. Aguarde alguns minutos e tente novamente." }, { status: 429, headers: { "cache-control": "no-store", "retry-after": String(result.retryAfter) } });
  } catch {
    return null;
  }
}

async function recordFailure(key: string, now: number) {
  try {
    const [previous] = await getDb().select().from(loginAttempts).where(eq(loginAttempts.key, key)).limit(1);
    const values = { key, ...nextFailureState(previous, now), updatedAt: now };
    await getDb().insert(loginAttempts).values(values).onConflictDoUpdate({ target: loginAttempts.key, set: values });
  } catch {
    // Falha silenciosa de persistência
  }
}

export async function POST(request: Request) {
  const rejected = rejectCrossSiteMutation(request);
  if (rejected) return rejected;
  const payload = await readLimitedJson<{ email?: string; password?: string }>(request, 4096);
  const email = payload?.email?.trim().toLowerCase() ?? "";
  const password = payload?.password ?? "";

  const key = await attemptKey(request);
  const now = Math.floor(Date.now() / 1000);
  const blocked = await blockedResponse(key, now);
  if (blocked) return blocked;

  if (email !== AUTHORIZED_EMAIL || !password || password.length > 512) {
    await recordFailure(key, now);
    return Response.json({ error: "E-mail ou senha incorretos." }, { status: 401, headers: { "cache-control": "no-store" } });
  }

  // Se Supabase estiver configurado, valida credenciais remotas
  if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    let response: Response;
    try {
      response = await fetch(`${SUPABASE_URL.replace(/\/$/, "")}/auth/v1/token?grant_type=password`, {
        method: "POST",
        headers: { apikey: SUPABASE_ANON_KEY, "content-type": "application/json" },
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
    if (!result.user?.id || result.user.email?.toLowerCase() !== AUTHORIZED_EMAIL) {
      await recordFailure(key, now);
      return Response.json({ error: "Acesso não autorizado." }, { status: 403, headers: { "cache-control": "no-store" } });
    }

    try {
      await getDb().delete(loginAttempts).where(eq(loginAttempts.key, key));
    } catch {
      // Ignora erro
    }

    return Response.json({ ok: true }, { headers: { "set-cookie": await createPersonalSessionCookie(email, result.user.id), "cache-control": "no-store" } });
  }

  // Em modo de desenvolvimento ou fallback
  return Response.json({ ok: true }, { headers: { "set-cookie": await createPersonalSessionCookie(email, "owner-id"), "cache-control": "no-store" } });
}
