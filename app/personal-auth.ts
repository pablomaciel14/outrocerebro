import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getChatGPTUser } from "./chatgpt-auth";

const COOKIE_NAME = "__Host-oc_session";
const LEGACY_COOKIE_NAME = "oc_personal_session";
const SESSION_SECONDS = 60 * 60 * 12;
const encoder = new TextEncoder();

const AUTHORIZED_EMAIL = (process.env.AUTHORIZED_EMAIL || "pablo@outrocerebro.com.br").toLowerCase();
const SESSION_SECRET = process.env.SESSION_SECRET || "outro-cerebro-sessao-segura-padrao-min-32-caracteres-2026";

type SessionPayload = { aud: "outro-cerebro"; email: string; sub: string; iat: number; exp: number; nonce: string; v: 2 };

export type PersonalUser = {
  userId: string;
  displayName: string;
  email: string;
};

function encodeBase64Url(value: Uint8Array | string) {
  const bytes = typeof value === "string" ? encoder.encode(value) : value;
  let binary = "";
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}

function decodeBase64Url(value: string) {
  const normalized = value.replaceAll("-", "+").replaceAll("_", "/");
  const binary = atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "="));
  return new Uint8Array(Array.from(binary, (character) => character.charCodeAt(0)));
}

async function signingKey() {
  const secret = SESSION_SECRET;
  if (!secret || encoder.encode(secret).byteLength < 32) throw new Error("Sessão pessoal não configurada com segurança.");
  return crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}

async function sign(value: string) {
  return encodeBase64Url(new Uint8Array(await crypto.subtle.sign("HMAC", await signingKey(), encoder.encode(value))));
}

function cookieValue(cookieHeader: string | null, name: string) {
  return cookieHeader?.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${name}=`))?.slice(name.length + 1) ?? null;
}

export async function createPersonalSessionCookie(email: string, subject: string) {
  const now = Math.floor(Date.now() / 1000);
  const payload: SessionPayload = { aud: "outro-cerebro", email: email.toLowerCase(), sub: subject, iat: now, exp: now + SESSION_SECONDS, nonce: crypto.randomUUID(), v: 2 };
  const encoded = encodeBase64Url(JSON.stringify(payload));
  return `${COOKIE_NAME}=${encoded}.${await sign(encoded)}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${SESSION_SECONDS}; Priority=High`;
}

export function clearPersonalSessionCookies() {
  return [COOKIE_NAME, LEGACY_COOKIE_NAME].map((name) => `${name}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0; Priority=High`);
}

export async function getPersonalUser(): Promise<PersonalUser | null> {
  const requestHeaders = await headers();
  const token = cookieValue(requestHeaders.get("cookie"), COOKIE_NAME);
  
  // Em ambiente de desenvolvimento local, provê usuário mock se não houver cookie ativo
  if (!token && process.env.NODE_ENV === "development") {
    return {
      userId: AUTHORIZED_EMAIL,
      displayName: "Pablo Maciel",
      email: AUTHORIZED_EMAIL,
    };
  }

  if (!token) return null;
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) return null;

  try {
    const valid = await crypto.subtle.verify("HMAC", await signingKey(), decodeBase64Url(signature), encoder.encode(encoded));
    if (!valid) return null;
    const payload = JSON.parse(new TextDecoder().decode(decodeBase64Url(encoded))) as SessionPayload;
    const now = Math.floor(Date.now() / 1000);
    if (!AUTHORIZED_EMAIL || payload.aud !== "outro-cerebro" || payload.v !== 2 || !payload.sub || !payload.nonce || payload.email !== AUTHORIZED_EMAIL || payload.iat > now + 60 || payload.exp <= now || payload.exp - payload.iat > SESSION_SECONDS) return null;
    const workspaceUser = await getChatGPTUser();
    return {
      userId: payload.email,
      displayName: workspaceUser?.displayName ?? "Pablo Maciel",
      email: payload.email,
    };
  } catch {
    if (process.env.NODE_ENV === "development") {
      return {
        userId: AUTHORIZED_EMAIL,
        displayName: "Pablo Maciel",
        email: AUTHORIZED_EMAIL,
      };
    }
    return null;
  }
}

export async function requirePersonalUser(): Promise<PersonalUser> {
  const user = await getPersonalUser();
  if (!user) redirect("/");
  return user;
}
