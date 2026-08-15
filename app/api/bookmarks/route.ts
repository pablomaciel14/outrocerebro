import { and, asc, eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { bookmarks, readings } from "../../../db/schema";
import { getPersonalUser } from "../../personal-auth";

export const dynamic = "force-dynamic";

async function ownsReading(readingId: string, userId: string) {
  const [reading] = await getDb().select({ id: readings.id }).from(readings)
    .where(and(eq(readings.id, readingId), eq(readings.userId, userId))).limit(1);
  return Boolean(reading);
}

export async function GET(request: Request) {
  const user = await getPersonalUser();
  if (!user) return Response.json({ error: "Não autorizado" }, { status: 401 });
  const readingId = new URL(request.url).searchParams.get("readingId");
  if (!readingId || !(await ownsReading(readingId, user.userId))) return Response.json({ error: "Leitura não encontrada" }, { status: 404 });
  const items = await getDb().select().from(bookmarks)
    .where(and(eq(bookmarks.readingId, readingId), eq(bookmarks.userId, user.userId)))
    .orderBy(asc(bookmarks.page));
  return Response.json({ bookmarks: items });
}

export async function POST(request: Request) {
  const user = await getPersonalUser();
  if (!user) return Response.json({ error: "Não autorizado" }, { status: 401 });
  const payload = await request.json() as { readingId?: string; page?: number };
  if (!payload.readingId || !Number.isFinite(payload.page)) return Response.json({ error: "Marcador inválido" }, { status: 400 });
  if (!(await ownsReading(payload.readingId, user.userId))) return Response.json({ error: "Leitura não encontrada" }, { status: 404 });
  const page = Math.max(1, Math.floor(payload.page!));
  const [existing] = await getDb().select().from(bookmarks).where(and(
    eq(bookmarks.readingId, payload.readingId), eq(bookmarks.userId, user.userId), eq(bookmarks.page, page),
  )).limit(1);
  if (existing) return Response.json({ bookmark: existing });
  const [item] = await getDb().insert(bookmarks).values({ id: crypto.randomUUID(), readingId: payload.readingId, userId: user.userId, page }).returning();
  return Response.json({ bookmark: item }, { status: 201 });
}

export async function DELETE(request: Request) {
  const user = await getPersonalUser();
  if (!user) return Response.json({ error: "Não autorizado" }, { status: 401 });
  const url = new URL(request.url);
  const readingId = url.searchParams.get("readingId");
  const page = Number(url.searchParams.get("page"));
  if (!readingId || !Number.isFinite(page)) return Response.json({ error: "Marcador inválido" }, { status: 400 });
  await getDb().delete(bookmarks).where(and(eq(bookmarks.readingId, readingId), eq(bookmarks.userId, user.userId), eq(bookmarks.page, Math.floor(page))));
  return Response.json({ ok: true });
}
