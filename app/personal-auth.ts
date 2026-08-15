import { env } from "cloudflare:workers";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getChatGPTUser } from "./chatgpt-auth";

const COOKIE_NAME = "oc_personal_session";
const SESSION_SECONDS = 60 * 60 * 24 * 30;
const encoder = new TextEncoder();
const runtimeEnv = env as unknown as { AUTHORIZED_EMAIL?: string; SESSION_SECRET?: string };

type SessionPayload = { email: string; exp: number };

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
  const secret = runtimeEnv.SESSION_SECRET;
  if (!secret) throw new Error("Sessão pessoal não configurada.");
  return crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}

async function sign(value: string) {
  return encodeBase64Url(new Uint8Array(await crypto.subtle.sign("HMAC", await signingKey(), encoder.encode(value))));
}

function cookieValue(cookieHeader: string | null, name: string) {
  return cookieHeader?.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${name}=`))?.slice(name.length + 1) ?? null;
}

export async function createPersonalSessionCookie(email: string) {
  const payload: SessionPayload = { email: email.toLowerCase(), exp: Math.floor(Date.now() / 1000) + SESSION_SECONDS };
  const encoded = encodeBase64Url(JSON.stringify(payload));
  return `${COOKIE_NAME}=${encoded}.${await sign(encoded)}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${SESSION_SECONDS}`;
}

export function clearPersonalSessionCookie() {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;
}

export async function getPersonalUser(): Promise<PersonalUser | null> {
  const requestHeaders = await headers();
  const token = cookieValue(requestHeaders.get("cookie"), COOKIE_NAME);
  if (!token) return null;
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) return null;

  try {
    const valid = await crypto.subtle.verify("HMAC", await signingKey(), decodeBase64Url(signature), encoder.encode(encoded));
    if (!valid) return null;
    const payload = JSON.parse(new TextDecoder().decode(decodeBase64Url(encoded))) as SessionPayload;
    const authorizedEmail = runtimeEnv.AUTHORIZED_EMAIL?.toLowerCase();
    if (!authorizedEmail || payload.email !== authorizedEmail || payload.exp <= Math.floor(Date.now() / 1000)) return null;
    const workspaceUser = await getChatGPTUser();
    return {
      userId: workspaceUser?.userId ?? payload.email,
      displayName: workspaceUser?.displayName ?? "Pablo Maciel",
      email: payload.email,
    };
  } catch {
    return null;
  }
}

export async function requirePersonalUser(): Promise<PersonalUser> {
  const user = await getPersonalUser();
  if (!user) redirect("/");
  return user;
}
