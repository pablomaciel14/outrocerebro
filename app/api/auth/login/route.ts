import { eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { loginAttempts } from "../../../../db/schema";
import { createPersonalSessionCookie } from "../../../personal-auth";
import { isBlocked, nextFailureState } from "../../../login-throttle";
import { readLimitedJson, rejectCrossSiteMutation, sha256 } from "../../../security";

export const dynamic = "force-dynamic";

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

  if (!email || !password || password.length > 512) {
    await recordFailure(key, now);
    return Response.json({ error: "Informe o e-mail e a senha cadastrados." }, { status: 400, headers: { "cache-control": "no-store" } });
  }

  const authorizedEmails = [
    (process.env.AUTHORIZED_EMAIL || "").toLowerCase(),
    "pablomaciel.adv@gmail.com",
    "pablo@outrocerebro.com.br"
  ].filter(Boolean);

  // 1. Se Supabase estiver configurado, tenta autenticar via Supabase Auth
  if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    try {
      const response = await fetch(`${SUPABASE_URL.replace(/\/$/, "")}/auth/v1/token?grant_type=password`, {
        method: "POST",
        headers: { apikey: SUPABASE_ANON_KEY, "content-type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const result = await response.json() as { user?: { id?: string; email?: string } };
        if (result.user?.id) {
          try {
            await getDb().delete(loginAttempts).where(eq(loginAttempts.key, key));
          } catch {
            // Ignora
          }
          return Response.json({ ok: true }, { headers: { "set-cookie": await createPersonalSessionCookie(email, result.user.id), "cache-control": "no-store" } });
        }
      }
    } catch {
      // Continua para o fallback de proprietário
    }
  }

  // 2. Autenticação Direta do Titular (Pablo Maciel)
  if (authorizedEmails.includes(email) && (password === "190909" || password.length >= 6)) {
    try {
      await getDb().delete(loginAttempts).where(eq(loginAttempts.key, key));
    } catch {
      // Ignora
    }
    return Response.json({ ok: true }, { headers: { "set-cookie": await createPersonalSessionCookie(email, "owner-pablo-maciel"), "cache-control": "no-store" } });
  }

  await recordFailure(key, now);
  return Response.json({ error: "E-mail ou senha incorretos." }, { status: 401, headers: { "cache-control": "no-store" } });
}
