import { and, desc, eq } from "drizzle-orm";
import { env } from "cloudflare:workers";
import { getDb } from "../../../db";
import { readings } from "../../../db/schema";
import { getPersonalUser } from "../../personal-auth";
import { readLimitedJson, rejectCrossSiteMutation, validUuid } from "../../security";

export const dynamic = "force-dynamic";

type PdfBucket = {
  put(key: string, value: ArrayBuffer, options?: { httpMetadata?: { contentType?: string } }): Promise<unknown>;
  head(key: string): Promise<{ size: number; httpMetadata?: { contentType?: string } } | null>;
  get(key: string, options?: { range?: { offset: number; length: number } }): Promise<{ body: ReadableStream; size: number; httpMetadata?: { contentType?: string } } | null>;
  delete(key: string): Promise<void>;
};

function bucket(): PdfBucket {
  const storage = (env as unknown as { PDF_FILES?: PdfBucket }).PDF_FILES;
  if (!storage) throw new Error("Armazenamento de PDFs indisponível.");
  return storage;
}

async function authenticatedUser() {
  const user = await getPersonalUser();
  if (!user) return null;
  return user;
}

function requestedRange(header: string | null, size: number) {
  if (!header) return null;
  const match = /^bytes=(\d+)-(\d*)$/.exec(header.trim());
  if (!match) return undefined;
  const start = Number(match[1]);
  const requestedEnd = match[2] ? Number(match[2]) : size - 1;
  if (!Number.isSafeInteger(start) || !Number.isSafeInteger(requestedEnd) || start < 0 || start >= size || requestedEnd < start) return undefined;
  const end = Math.min(requestedEnd, size - 1);
  return { offset: start, length: end - start + 1, end };
}

export async function GET(request: Request) {
  const user = await authenticatedUser();
  if (!user) return Response.json({ error: "Não autorizado" }, { status: 401 });
  const url = new URL(request.url);
  const fileId = url.searchParams.get("file");

  if (fileId) {
    if (!validUuid(fileId)) return Response.json({ error: "Arquivo não encontrado" }, { status: 404 });
    const [record] = await getDb().select({ r2Key: readings.r2Key, fileName: readings.fileName })
      .from(readings).where(and(eq(readings.id, fileId), eq(readings.userId, user.userId))).limit(1);
    if (!record) return Response.json({ error: "Arquivo não encontrado" }, { status: 404 });
    const metadata = await bucket().head(record.r2Key);
    if (!metadata) return Response.json({ error: "PDF não encontrado" }, { status: 404 });
    const range = requestedRange(request.headers.get("range"), metadata.size);
    if (range === undefined) return new Response(null, {
      status: 416,
      headers: { "content-range": `bytes */${metadata.size}`, "accept-ranges": "bytes", "cache-control": "private, no-store" },
    });
    const object = await bucket().get(record.r2Key, range ? { range: { offset: range.offset, length: range.length } } : undefined);
    if (!object) return Response.json({ error: "PDF não encontrado" }, { status: 404 });
    const responseHeaders: Record<string, string> = {
      "content-type": object.httpMetadata?.contentType ?? metadata.httpMetadata?.contentType ?? "application/pdf",
      "content-disposition": `inline; filename*=UTF-8''${encodeURIComponent(record.fileName)}`,
      "content-length": String(range?.length ?? metadata.size),
      "accept-ranges": "bytes",
      "cache-control": "private, no-store",
      "x-content-type-options": "nosniff",
      "content-security-policy": "sandbox",
    };
    if (range) responseHeaders["content-range"] = `bytes ${range.offset}-${range.end}/${metadata.size}`;
    return new Response(object.body, {
      status: range ? 206 : 200,
      headers: responseHeaders,
    });
  }

  const items = await getDb().select().from(readings)
    .where(eq(readings.userId, user.userId)).orderBy(desc(readings.updatedAt));
  return Response.json({ readings: items });
}

export async function POST(request: Request) {
  const rejected = rejectCrossSiteMutation(request);
  if (rejected) return rejected;
  const user = await authenticatedUser();
  if (!user) return Response.json({ error: "Não autorizado" }, { status: 401 });
  const contentType = request.headers.get("content-type")?.toLowerCase() ?? "";
  const declaredLength = Number(request.headers.get("content-length") ?? 0);
  if (!contentType.startsWith("multipart/form-data") || (declaredLength && declaredLength > 48 * 1024 * 1024)) return Response.json({ error: "Upload inválido ou muito grande." }, { status: 413 });
  const form = await request.formData();
  const file = form.get("file");
  const title = String(form.get("title") ?? "").trim();
  const markdown = String(form.get("markdown") ?? "");
  const totalPages = Math.max(1, Number(form.get("totalPages") ?? 1));
  if (!(file instanceof File) || file.type !== "application/pdf") return Response.json({ error: "Selecione um PDF válido." }, { status: 400 });
  if (file.size > 40 * 1024 * 1024) return Response.json({ error: "O PDF deve ter no máximo 40 MB." }, { status: 413 });
  if (title.length > 300 || file.name.length > 260 || new TextEncoder().encode(markdown).byteLength > 8 * 1024 * 1024) return Response.json({ error: "Metadados do PDF excedem o limite permitido." }, { status: 413 });
  if (!Number.isFinite(totalPages) || totalPages > 100000) return Response.json({ error: "Número de páginas inválido." }, { status: 400 });
  const fileBuffer = await file.arrayBuffer();
  const signature = new TextDecoder().decode(new Uint8Array(fileBuffer, 0, Math.min(5, fileBuffer.byteLength)));
  if (signature !== "%PDF-") return Response.json({ error: "O arquivo não contém uma assinatura PDF válida." }, { status: 400 });
  const id = crypto.randomUUID();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const r2Key = `${user.userId}/${id}/${safeName}`;
  await bucket().put(r2Key, fileBuffer, { httpMetadata: { contentType: "application/pdf" } });
  try {
    const [item] = await getDb().insert(readings).values({
      id, userId: user.userId, title: title || file.name.replace(/\.pdf$/i, ""),
      fileName: file.name, r2Key, markdown, totalPages, status: "wishlist",
    }).returning();
    return Response.json({ reading: item }, { status: 201 });
  } catch (error) {
    await bucket().delete(r2Key);
    throw error;
  }
}

export async function PATCH(request: Request) {
  const rejected = rejectCrossSiteMutation(request);
  if (rejected) return rejected;
  const user = await authenticatedUser();
  if (!user) return Response.json({ error: "Não autorizado" }, { status: 401 });
  const payload = await readLimitedJson<{ id?: string; status?: "wishlist" | "reading" | "read"; currentPage?: number; totalSeconds?: number }>(request);
  if (!payload || !validUuid(payload.id)) return Response.json({ error: "Registro inválido" }, { status: 400 });
  const changes: Partial<typeof readings.$inferInsert> = { updatedAt: new Date().toISOString() };
  if (payload.status && ["wishlist", "reading", "read"].includes(payload.status)) {
    changes.status = payload.status;
    changes.completedAt = payload.status === "read" ? new Date().toISOString() : null;
  }
  if (Number.isFinite(payload.currentPage)) changes.currentPage = Math.min(100000, Math.max(1, Math.floor(payload.currentPage!)));
  if (Number.isFinite(payload.totalSeconds)) changes.totalSeconds = Math.min(315360000, Math.max(0, Math.floor(payload.totalSeconds!)));
  const [item] = await getDb().update(readings).set(changes)
    .where(and(eq(readings.id, payload.id), eq(readings.userId, user.userId))).returning();
  if (!item) return Response.json({ error: "Leitura não encontrada" }, { status: 404 });
  return Response.json({ reading: item });
}

export async function DELETE(request: Request) {
  const rejected = rejectCrossSiteMutation(request);
  if (rejected) return rejected;
  const user = await authenticatedUser();
  if (!user) return Response.json({ error: "Não autorizado" }, { status: 401 });
  const id = new URL(request.url).searchParams.get("id");
  if (!validUuid(id)) return Response.json({ error: "Registro inválido" }, { status: 400 });
  const [item] = await getDb().select().from(readings).where(and(eq(readings.id, id), eq(readings.userId, user.userId))).limit(1);
  if (!item) return Response.json({ error: "Leitura não encontrada" }, { status: 404 });
  await bucket().delete(item.r2Key);
  await getDb().delete(readings).where(and(eq(readings.id, id), eq(readings.userId, user.userId)));
  return Response.json({ ok: true });
}
