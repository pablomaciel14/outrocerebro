const JSON_LIMIT = 16 * 1024;

export function rejectCrossSiteMutation(request: Request) {
  const origin = request.headers.get("origin");
  const expectedOrigin = new URL(request.url).origin;
  const fetchSite = request.headers.get("sec-fetch-site");
  if (origin !== expectedOrigin || (fetchSite && fetchSite !== "same-origin")) {
    return Response.json({ error: "Requisição não autorizada." }, { status: 403, headers: { "cache-control": "no-store" } });
  }
  return null;
}

export async function readLimitedJson<T>(request: Request, limit = JSON_LIMIT): Promise<T | null> {
  const type = request.headers.get("content-type")?.toLowerCase() ?? "";
  const declaredLength = Number(request.headers.get("content-length") ?? 0);
  if (!type.startsWith("application/json") || (declaredLength && declaredLength > limit)) return null;
  const body = await request.text();
  if (!body || new TextEncoder().encode(body).byteLength > limit) return null;
  try { return JSON.parse(body) as T; } catch { return null; }
}

export function validUuid(value: string | null | undefined): value is string {
  return Boolean(value && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value));
}

export async function sha256(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export type PdfValidation =
  | { ok: true; fileBuffer: ArrayBuffer; safeName: string }
  | { ok: false; status: number; error: string };

export async function validatePdfSubmission(input: { file: unknown; title: string; markdown: string; totalPages: number }): Promise<PdfValidation> {
  const { file, title, markdown, totalPages } = input;
  if (!(file instanceof File) || file.type !== "application/pdf") return { ok: false, status: 400, error: "Selecione um PDF válido." };
  if (file.size > 40 * 1024 * 1024) return { ok: false, status: 413, error: "O PDF deve ter no máximo 40 MB." };
  if (title.length > 300 || file.name.length > 260 || new TextEncoder().encode(markdown).byteLength > 8 * 1024 * 1024) return { ok: false, status: 413, error: "Metadados do PDF excedem o limite permitido." };
  if (!Number.isFinite(totalPages) || totalPages > 100000) return { ok: false, status: 400, error: "Número de páginas inválido." };
  const fileBuffer = await file.arrayBuffer();
  const signature = new TextDecoder().decode(new Uint8Array(fileBuffer, 0, Math.min(5, fileBuffer.byteLength)));
  if (signature !== "%PDF-") return { ok: false, status: 400, error: "O arquivo não contém uma assinatura PDF válida." };
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  return { ok: true, fileBuffer, safeName };
}
