import { and, desc, eq } from "drizzle-orm";
import { env } from "cloudflare:workers";
import { getDb } from "../../../db";
import { readings } from "../../../db/schema";
import { getPersonalUser } from "../../personal-auth";

export const dynamic = "force-dynamic";

type PdfBucket = {
  put(key: string, value: ArrayBuffer, options?: { httpMetadata?: { contentType?: string } }): Promise<unknown>;
  get(key: string): Promise<{ body: ReadableStream; httpMetadata?: { contentType?: string } } | null>;
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

export async function GET(request: Request) {
  const user = await authenticatedUser();
  if (!user) return Response.json({ error: "Não autorizado" }, { status: 401 });
  const url = new URL(request.url);
  const fileId = url.searchParams.get("file");

  if (fileId) {
    const [record] = await getDb().select({ r2Key: readings.r2Key, fileName: readings.fileName })
      .from(readings).where(and(eq(readings.id, fileId), eq(readings.userId, user.userId))).limit(1);
    if (!record) return Response.json({ error: "Arquivo não encontrado" }, { status: 404 });
    const object = await bucket().get(record.r2Key);
    if (!object) return Response.json({ error: "PDF não encontrado" }, { status: 404 });
    return new Response(object.body, {
      headers: {
        "content-type": object.httpMetadata?.contentType ?? "application/pdf",
        "content-disposition": `inline; filename*=UTF-8''${encodeURIComponent(record.fileName)}`,
        "cache-control": "private, no-store",
      },
    });
  }

  const items = await getDb().select().from(readings)
    .where(eq(readings.userId, user.userId)).orderBy(desc(readings.updatedAt));
  return Response.json({ readings: items });
}

export async function POST(request: Request) {
  const user = await authenticatedUser();
  if (!user) return Response.json({ error: "Não autorizado" }, { status: 401 });
  const form = await request.formData();
  const file = form.get("file");
  const title = String(form.get("title") ?? "").trim();
  const markdown = String(form.get("markdown") ?? "");
  const totalPages = Math.max(1, Number(form.get("totalPages") ?? 1));
  if (!(file instanceof File) || file.type !== "application/pdf") return Response.json({ error: "Selecione um PDF válido." }, { status: 400 });
  if (file.size > 40 * 1024 * 1024) return Response.json({ error: "O PDF deve ter no máximo 40 MB." }, { status: 413 });
  const id = crypto.randomUUID();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const r2Key = `${user.userId}/${id}/${safeName}`;
  await bucket().put(r2Key, await file.arrayBuffer(), { httpMetadata: { contentType: "application/pdf" } });
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
  const user = await authenticatedUser();
  if (!user) return Response.json({ error: "Não autorizado" }, { status: 401 });
  const payload = await request.json() as { id?: string; status?: "wishlist" | "reading" | "read"; currentPage?: number; totalSeconds?: number };
  if (!payload.id) return Response.json({ error: "Registro inválido" }, { status: 400 });
  const changes: Partial<typeof readings.$inferInsert> = { updatedAt: new Date().toISOString() };
  if (payload.status && ["wishlist", "reading", "read"].includes(payload.status)) {
    changes.status = payload.status;
    changes.completedAt = payload.status === "read" ? new Date().toISOString() : null;
  }
  if (Number.isFinite(payload.currentPage)) changes.currentPage = Math.max(1, Math.floor(payload.currentPage!));
  if (Number.isFinite(payload.totalSeconds)) changes.totalSeconds = Math.max(0, Math.floor(payload.totalSeconds!));
  const [item] = await getDb().update(readings).set(changes)
    .where(and(eq(readings.id, payload.id), eq(readings.userId, user.userId))).returning();
  if (!item) return Response.json({ error: "Leitura não encontrada" }, { status: 404 });
  return Response.json({ reading: item });
}

export async function DELETE(request: Request) {
  const user = await authenticatedUser();
  if (!user) return Response.json({ error: "Não autorizado" }, { status: 401 });
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return Response.json({ error: "Registro inválido" }, { status: 400 });
  const [item] = await getDb().select().from(readings).where(and(eq(readings.id, id), eq(readings.userId, user.userId))).limit(1);
  if (!item) return Response.json({ error: "Leitura não encontrada" }, { status: 404 });
  await bucket().delete(item.r2Key);
  await getDb().delete(readings).where(and(eq(readings.id, id), eq(readings.userId, user.userId)));
  return Response.json({ ok: true });
}
