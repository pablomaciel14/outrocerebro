import { and, desc, eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { highlights, readings } from "../../../db/schema";
import { getChatGPTUser } from "../../chatgpt-auth";

export const dynamic = "force-dynamic";

const colors = ["yellow", "green", "blue", "pink", "violet"] as const;
type HighlightColor = typeof colors[number];
type HighlightRect = { x: number; y: number; width: number; height: number };

function normalizeRects(rects: unknown): HighlightRect[] {
  if (!Array.isArray(rects)) return [];
  const clamp = (value: number) => Math.max(0, Math.min(1, value));
  return rects.slice(0, 100).flatMap((rect) => {
    if (!rect || typeof rect !== "object") return [];
    const candidate = rect as Partial<HighlightRect>;
    if (![candidate.x, candidate.y, candidate.width, candidate.height].every((value) => typeof value === "number" && Number.isFinite(value))) return [];
    const x = clamp(candidate.x!);
    const y = clamp(candidate.y!);
    const width = Math.min(clamp(candidate.width!), 1 - x);
    const height = Math.min(clamp(candidate.height!), 1 - y);
    return width > 0 && height > 0 ? [{ x, y, width, height }] : [];
  });
}

async function ownsReading(readingId: string, userId: string) {
  const [reading] = await getDb().select({ id: readings.id }).from(readings)
    .where(and(eq(readings.id, readingId), eq(readings.userId, userId))).limit(1);
  return Boolean(reading);
}

export async function GET(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Não autorizado" }, { status: 401 });
  const readingId = new URL(request.url).searchParams.get("readingId");
  if (!readingId || !(await ownsReading(readingId, user.userId))) return Response.json({ error: "Leitura não encontrada" }, { status: 404 });
  const items = await getDb().select().from(highlights)
    .where(and(eq(highlights.readingId, readingId), eq(highlights.userId, user.userId)))
    .orderBy(desc(highlights.createdAt));
  return Response.json({ highlights: items });
}

export async function POST(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Não autorizado" }, { status: 401 });
  const payload = await request.json() as { readingId?: string; source?: "pdf" | "markdown"; page?: number | null; quote?: string; color?: HighlightColor; note?: string; rects?: unknown };
  const quote = payload.quote?.trim().slice(0, 3000) ?? "";
  if (!payload.readingId || !quote || !payload.source || !["pdf", "markdown"].includes(payload.source)) return Response.json({ error: "Destaque inválido" }, { status: 400 });
  if (!(await ownsReading(payload.readingId, user.userId))) return Response.json({ error: "Leitura não encontrada" }, { status: 404 });
  const color = colors.includes(payload.color as HighlightColor) ? payload.color! : "yellow";
  const [item] = await getDb().insert(highlights).values({
    id: crypto.randomUUID(), readingId: payload.readingId, userId: user.userId,
    source: payload.source, page: payload.source === "pdf" ? Math.max(1, Math.floor(payload.page ?? 1)) : null,
    quote, color, note: payload.note?.trim().slice(0, 2000) ?? "",
    rects: JSON.stringify(payload.source === "pdf" ? normalizeRects(payload.rects) : []),
  }).returning();
  return Response.json({ highlight: item }, { status: 201 });
}

export async function DELETE(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Não autorizado" }, { status: 401 });
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return Response.json({ error: "Destaque inválido" }, { status: 400 });
  const [item] = await getDb().delete(highlights)
    .where(and(eq(highlights.id, id), eq(highlights.userId, user.userId))).returning();
  if (!item) return Response.json({ error: "Destaque não encontrado" }, { status: 404 });
  return Response.json({ ok: true });
}
