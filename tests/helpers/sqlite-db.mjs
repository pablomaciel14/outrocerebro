import { DatabaseSync } from "node:sqlite";
import { readdir, readFile } from "node:fs/promises";
import { drizzle } from "drizzle-orm/sqlite-proxy";
import * as schema from "../../db/schema.ts";

const migrationsDir = new URL("../../drizzle/", import.meta.url);

async function applyMigrations(sqlite) {
  const entries = (await readdir(migrationsDir)).filter((name) => name.endsWith(".sql")).sort();
  for (const name of entries) {
    const content = await readFile(new URL(name, migrationsDir), "utf8");
    for (const statement of content.split("--> statement-breakpoint")) {
      const trimmed = statement.trim();
      if (trimmed) sqlite.exec(trimmed);
    }
  }
}

// Real production migrations run against an in-memory SQLite engine (Node's built-in node:sqlite),
// wired to drizzle-orm's sqlite-proxy driver — same schema and query semantics as D1, no mocks.
export async function createTestDb() {
  const sqlite = new DatabaseSync(":memory:");
  sqlite.exec("PRAGMA foreign_keys = ON");
  await applyMigrations(sqlite);

  const callback = async (sql, params, method) => {
    const statement = sqlite.prepare(sql);
    if (method === "run") {
      statement.run(...params);
      return { rows: [] };
    }
    if (method === "get") {
      const row = statement.get(...params);
      return { rows: row ? Object.values(row) : undefined };
    }
    const rows = statement.all(...params).map((row) => Object.values(row));
    return { rows };
  };

  const db = drizzle(callback, { schema });
  return { db, sqlite, close: () => sqlite.close() };
}
