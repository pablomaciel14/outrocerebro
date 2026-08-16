import { and, desc, eq, gte, lte } from "drizzle-orm";
import { getDb } from "../../../db";
import { agendaItems, workspacePages } from "../../../db/schema";
import { getPersonalUser } from "../../personal-auth";
import { readLimitedJson, rejectCrossSiteMutation, validUuid } from "../../security";

export const dynamic = "force-dynamic";

const AREAS = new Set(["memoria", "raciocinio", "conexoes"]);
const COLORS = new Set(["violet", "cyan", "green", "amber", "coral"]);
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

type PageArea = "memoria" | "raciocinio" | "conexoes";
type AgendaColor = "violet" | "cyan" | "green" | "amber" | "coral";

async function userId() {
  return (await getPersonalUser())?.userId ?? null;
}

export async function GET(request: Request) {
  const ownerId = await userId();
  if (!ownerId) return Response.json({ error: "Não autorizado" }, { status: 401 });

  const url = new URL(request.url);
  const area = url.searchParams.get("area");
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");
  const pageArea = area && AREAS.has(area) ? area as PageArea : "memoria";

  const pagesPromise = getDb().select().from(workspacePages)
    .where(and(eq(workspacePages.userId, ownerId), eq(workspacePages.area, pageArea)))
    .orderBy(desc(workspacePages.favorite), desc(workspacePages.updatedAt));

  const agendaPromise = from && to && DATE_PATTERN.test(from) && DATE_PATTERN.test(to)
    ? getDb().select().from(agendaItems).where(and(
        eq(agendaItems.userId, ownerId),
        gte(agendaItems.date, from),
        lte(agendaItems.date, to),
      )).orderBy(agendaItems.date, agendaItems.startTime)
    : Promise.resolve([]);

  const [pages, agenda] = await Promise.all([pagesPromise, agendaPromise]);
  return Response.json({ pages, agenda }, { headers: { "cache-control": "private, no-store" } });
}

export async function POST(request: Request) {
  const rejected = rejectCrossSiteMutation(request);
  if (rejected) return rejected;
  const ownerId = await userId();
  if (!ownerId) return Response.json({ error: "Não autorizado" }, { status: 401 });

  const payload = await readLimitedJson<Record<string, unknown>>(request, 300 * 1024);
  if (!payload) return Response.json({ error: "Dados inválidos" }, { status: 400 });
  const now = new Date().toISOString();

  if (payload.type === "page") {
    const area = String(payload.area ?? "");
    const title = String(payload.title ?? "").trim();
    if (!AREAS.has(area) || !title || title.length > 200) return Response.json({ error: "Página inválida" }, { status: 400 });
    const [page] = await getDb().insert(workspacePages).values({
      id: crypto.randomUUID(),
      userId: ownerId, area: area as PageArea, title,
      content: String(payload.content ?? "").slice(0, 250_000),
      icon: String(payload.icon ?? "📝").slice(0, 8),
      createdAt: now, updatedAt: now,
    }).returning();
    return Response.json({ page }, { status: 201 });
  }

  if (payload.type === "agenda") {
    const title = String(payload.title ?? "").trim();
    const date = String(payload.date ?? "");
    const kind = payload.kind === "event" ? "event" : "task";
    const color = COLORS.has(String(payload.color)) ? String(payload.color) as AgendaColor : "violet";
    const startTime = payload.startTime ? String(payload.startTime) : null;
    const endTime = payload.endTime ? String(payload.endTime) : null;
    if (!title || title.length > 180 || !DATE_PATTERN.test(date) || (startTime && !TIME_PATTERN.test(startTime)) || (endTime && !TIME_PATTERN.test(endTime))) {
      return Response.json({ error: "Compromisso inválido" }, { status: 400 });
    }
    const [item] = await getDb().insert(agendaItems).values({
      id: crypto.randomUUID(), userId: ownerId, title, date, kind, color,
      notes: String(payload.notes ?? "").slice(0, 4000), startTime, endTime,
      createdAt: now, updatedAt: now,
    }).returning();
    return Response.json({ item }, { status: 201 });
  }

  return Response.json({ error: "Tipo inválido" }, { status: 400 });
}

export async function PATCH(request: Request) {
  const rejected = rejectCrossSiteMutation(request);
  if (rejected) return rejected;
  const ownerId = await userId();
  if (!ownerId) return Response.json({ error: "Não autorizado" }, { status: 401 });
  const payload = await readLimitedJson<Record<string, unknown>>(request, 300 * 1024);
  if (!payload || !validUuid(String(payload.id ?? ""))) return Response.json({ error: "Registro inválido" }, { status: 400 });
  const id = String(payload.id);

  if (payload.type === "page") {
    const changes: Partial<typeof workspacePages.$inferInsert> = { updatedAt: new Date().toISOString() };
    if (typeof payload.title === "string") changes.title = payload.title.trim().slice(0, 200) || "Sem título";
    if (typeof payload.content === "string") changes.content = payload.content.slice(0, 250_000);
    if (typeof payload.icon === "string") changes.icon = payload.icon.slice(0, 8);
    if (typeof payload.favorite === "boolean") changes.favorite = payload.favorite;
    const [page] = await getDb().update(workspacePages).set(changes)
      .where(and(eq(workspacePages.id, id), eq(workspacePages.userId, ownerId))).returning();
    return page ? Response.json({ page }) : Response.json({ error: "Página não encontrada" }, { status: 404 });
  }

  if (payload.type === "agenda") {
    const changes: Partial<typeof agendaItems.$inferInsert> = { updatedAt: new Date().toISOString() };
    if (typeof payload.title === "string") changes.title = payload.title.trim().slice(0, 180) || "Sem título";
    if (typeof payload.notes === "string") changes.notes = payload.notes.slice(0, 4000);
    if (typeof payload.done === "boolean") changes.done = payload.done;
    if (typeof payload.date === "string" && DATE_PATTERN.test(payload.date)) changes.date = payload.date;
    if (payload.startTime === null || (typeof payload.startTime === "string" && TIME_PATTERN.test(payload.startTime))) changes.startTime = payload.startTime;
    if (payload.endTime === null || (typeof payload.endTime === "string" && TIME_PATTERN.test(payload.endTime))) changes.endTime = payload.endTime;
    if (payload.kind === "task" || payload.kind === "event") changes.kind = payload.kind;
    if (COLORS.has(String(payload.color))) changes.color = String(payload.color) as AgendaColor;
    const [item] = await getDb().update(agendaItems).set(changes)
      .where(and(eq(agendaItems.id, id), eq(agendaItems.userId, ownerId))).returning();
    return item ? Response.json({ item }) : Response.json({ error: "Compromisso não encontrado" }, { status: 404 });
  }

  return Response.json({ error: "Tipo inválido" }, { status: 400 });
}

export async function DELETE(request: Request) {
  const rejected = rejectCrossSiteMutation(request);
  if (rejected) return rejected;
  const ownerId = await userId();
  if (!ownerId) return Response.json({ error: "Não autorizado" }, { status: 401 });
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  const type = url.searchParams.get("type");
  if (!validUuid(id)) return Response.json({ error: "Registro inválido" }, { status: 400 });
  if (type === "page") await getDb().delete(workspacePages).where(and(eq(workspacePages.id, id), eq(workspacePages.userId, ownerId)));
  else if (type === "agenda") await getDb().delete(agendaItems).where(and(eq(agendaItems.id, id), eq(agendaItems.userId, ownerId)));
  else return Response.json({ error: "Tipo inválido" }, { status: 400 });
  return Response.json({ ok: true });
}
