import { env } from "cloudflare:workers";
import { createPersonalSessionCookie } from "../../../personal-auth";

export const dynamic = "force-dynamic";
const runtimeEnv = env as unknown as { AUTHORIZED_EMAIL?: string; SUPABASE_URL?: string; SUPABASE_PUBLISHABLE_KEY?: string };

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null) as { email?: string; password?: string } | null;
  const email = payload?.email?.trim().toLowerCase() ?? "";
  const password = payload?.password ?? "";
  const authorizedEmail = runtimeEnv.AUTHORIZED_EMAIL?.toLowerCase();
  const supabaseUrl = runtimeEnv.SUPABASE_URL;
  const publishableKey = runtimeEnv.SUPABASE_PUBLISHABLE_KEY;

  if (!authorizedEmail || !supabaseUrl || !publishableKey) return Response.json({ error: "Autenticação indisponível." }, { status: 503 });
  if (email !== authorizedEmail || !password) return Response.json({ error: "E-mail ou senha incorretos." }, { status: 401 });

  const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { apikey: publishableKey, "content-type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) return Response.json({ error: "E-mail ou senha incorretos." }, { status: 401 });

  const result = await response.json() as { user?: { email?: string } };
  if (result.user?.email?.toLowerCase() !== authorizedEmail) return Response.json({ error: "Acesso não autorizado." }, { status: 403 });

  return Response.json({ ok: true }, { headers: { "set-cookie": await createPersonalSessionCookie(email), "cache-control": "no-store" } });
}
