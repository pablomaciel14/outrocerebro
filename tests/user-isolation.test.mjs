import assert from "node:assert/strict";
import test from "node:test";
import { and, eq } from "drizzle-orm";
import { createTestDb } from "./helpers/sqlite-db.mjs";
import { agendaItems, bookmarks, highlights, readings, userPreferences, workspacePages } from "../db/schema.ts";

// Every API route scopes reads/writes with `and(eq(table.id, id), eq(table.userId, ownerId))`.
// These tests exercise that exact pattern against a real SQLite engine running the real
// production migrations, to prove a second user's id can never reach the first user's row.
const ALICE = "alice@example.com";
const BOB = "bob@example.com";

async function assertOwnerScoped(db, table, row) {
  await db.insert(table).values(row);
  const [owned] = await db.select().from(table).where(and(eq(table.id, row.id), eq(table.userId, row.userId)));
  assert.ok(owned, "the owner must be able to read their own row");

  const stolen = await db.select().from(table).where(and(eq(table.id, row.id), eq(table.userId, BOB === row.userId ? ALICE : BOB)));
  assert.equal(stolen.length, 0, "a different userId must never see the row, even with the correct id");

  const deletedByOther = await db.delete(table).where(and(eq(table.id, row.id), eq(table.userId, BOB === row.userId ? ALICE : BOB))).returning();
  assert.equal(deletedByOther.length, 0, "a different userId must not be able to delete the row");
  const [stillThere] = await db.select().from(table).where(eq(table.id, row.id));
  assert.ok(stillThere, "the row must survive an other-user delete attempt");
}

test("workspace pages are isolated per userId", async () => {
  const { db, close } = await createTestDb();
  try {
    await assertOwnerScoped(db, workspacePages, { id: "11111111-1111-4111-8111-111111111111", userId: ALICE, title: "Nota da Alice", content: "segredo" });
  } finally { close(); }
});

test("agenda items are isolated per userId", async () => {
  const { db, close } = await createTestDb();
  try {
    await assertOwnerScoped(db, agendaItems, { id: "22222222-2222-4222-8222-222222222222", userId: ALICE, title: "Consulta", date: "2026-08-20" });
  } finally { close(); }
});

test("readings (PDF library entries) are isolated per userId", async () => {
  const { db, close } = await createTestDb();
  try {
    await assertOwnerScoped(db, readings, {
      id: "33333333-3333-4333-8333-333333333333", userId: ALICE, title: "Contrato", fileName: "contrato.pdf", r2Key: `${ALICE}/33333333-3333-4333-8333-333333333333/contrato.pdf`,
    });
  } finally { close(); }
});

test("highlights are isolated per userId even though bob cannot see the underlying reading either", async () => {
  const { db, close } = await createTestDb();
  try {
    const readingId = "44444444-4444-4444-8444-444444444444";
    await db.insert(readings).values({ id: readingId, userId: ALICE, title: "Livro", fileName: "livro.pdf", r2Key: `${ALICE}/${readingId}/livro.pdf` });
    await assertOwnerScoped(db, highlights, { id: "55555555-5555-4555-8555-555555555555", readingId, userId: ALICE, source: "pdf", quote: "trecho importante" });
  } finally { close(); }
});

test("bookmarks are isolated per userId", async () => {
  const { db, close } = await createTestDb();
  try {
    const readingId = "66666666-6666-4666-8666-666666666666";
    await db.insert(readings).values({ id: readingId, userId: ALICE, title: "Livro", fileName: "livro.pdf", r2Key: `${ALICE}/${readingId}/livro.pdf` });
    await assertOwnerScoped(db, bookmarks, { id: "77777777-7777-4777-8777-777777777777", readingId, userId: ALICE, page: 12 });
  } finally { close(); }
});

test("two users can independently own rows with a colliding foreign key without leaking into each other's list", async () => {
  const { db, close } = await createTestDb();
  try {
    await db.insert(workspacePages).values([
      { id: "88888888-8888-4888-8888-888888888881", userId: ALICE, title: "Alice 1", content: "" },
      { id: "88888888-8888-4888-8888-888888888882", userId: ALICE, title: "Alice 2", content: "" },
      { id: "88888888-8888-4888-8888-888888888883", userId: BOB, title: "Bob 1", content: "" },
    ]);
    const aliceRows = await db.select().from(workspacePages).where(eq(workspacePages.userId, ALICE));
    const bobRows = await db.select().from(workspacePages).where(eq(workspacePages.userId, BOB));
    assert.equal(aliceRows.length, 2);
    assert.equal(bobRows.length, 1);
    assert.ok(aliceRows.every((row) => row.userId === ALICE));
    assert.ok(bobRows.every((row) => row.userId === BOB));
  } finally { close(); }
});

test("each user's default-area preference is keyed by their own userId and never leaks into another user's read", async () => {
  const { db, close } = await createTestDb();
  try {
    await db.insert(userPreferences).values({ userId: ALICE, defaultArea: "agenda" });
    await db.insert(userPreferences).values({ userId: BOB, defaultArea: "conexoes" });

    const [aliceRow] = await db.select().from(userPreferences).where(eq(userPreferences.userId, ALICE));
    const [bobRow] = await db.select().from(userPreferences).where(eq(userPreferences.userId, BOB));
    assert.equal(aliceRow.defaultArea, "agenda");
    assert.equal(bobRow.defaultArea, "conexoes");

    // upsert-by-userId (the exact PATCH /api/preferences pattern) must only ever touch the caller's own row
    await db.insert(userPreferences).values({ userId: ALICE, defaultArea: "raciocinio" })
      .onConflictDoUpdate({ target: userPreferences.userId, set: { defaultArea: "raciocinio" } });
    const [bobAfterAliceUpdate] = await db.select().from(userPreferences).where(eq(userPreferences.userId, BOB));
    assert.equal(bobAfterAliceUpdate.defaultArea, "conexoes");
  } finally { close(); }
});

test("deleting a reading cascades to its highlights and bookmarks (docs/03-DADOS-E-SEGURANCA.md claim)", async () => {
  const { db, close } = await createTestDb();
  try {
    const readingId = "99999999-9999-4999-8999-999999999999";
    await db.insert(readings).values({ id: readingId, userId: ALICE, title: "Livro", fileName: "livro.pdf", r2Key: `${ALICE}/${readingId}/livro.pdf` });
    await db.insert(highlights).values({ id: "aaaaaaa1-aaaa-4aaa-8aaa-aaaaaaaaaaaa", readingId, userId: ALICE, source: "pdf", quote: "x" });
    await db.insert(bookmarks).values({ id: "aaaaaaa2-aaaa-4aaa-8aaa-aaaaaaaaaaaa", readingId, userId: ALICE, page: 1 });

    await db.delete(readings).where(eq(readings.id, readingId));

    const remainingHighlights = await db.select().from(highlights).where(eq(highlights.readingId, readingId));
    const remainingBookmarks = await db.select().from(bookmarks).where(eq(bookmarks.readingId, readingId));
    assert.equal(remainingHighlights.length, 0);
    assert.equal(remainingBookmarks.length, 0);
  } finally { close(); }
});
