import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const readings = sqliteTable("readings", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  fileName: text("file_name").notNull(),
  r2Key: text("r2_key").notNull(),
  markdown: text("markdown").notNull().default(""),
  status: text("status", { enum: ["wishlist", "reading", "read"] }).notNull().default("wishlist"),
  currentPage: integer("current_page").notNull().default(1),
  totalPages: integer("total_pages").notNull().default(1),
  totalSeconds: integer("total_seconds").notNull().default(0),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  completedAt: text("completed_at"),
}, (table) => [
  index("idx_readings_user_updated").on(table.userId, table.updatedAt),
  index("idx_readings_user_status").on(table.userId, table.status),
]);

export const highlights = sqliteTable("highlights", {
  id: text("id").primaryKey(),
  readingId: text("reading_id").notNull().references(() => readings.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull(),
  source: text("source", { enum: ["pdf", "markdown"] }).notNull(),
  page: integer("page"),
  quote: text("quote").notNull(),
  color: text("color", { enum: ["yellow", "green", "blue", "pink", "violet"] }).notNull().default("yellow"),
  note: text("note").notNull().default(""),
  rects: text("rects").notNull().default("[]"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  index("idx_highlights_user_reading").on(table.userId, table.readingId),
]);

export const bookmarks = sqliteTable("bookmarks", {
  id: text("id").primaryKey(),
  readingId: text("reading_id").notNull().references(() => readings.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull(),
  page: integer("page").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  uniqueIndex("idx_bookmarks_user_reading_page").on(table.userId, table.readingId, table.page),
]);

export const loginAttempts = sqliteTable("login_attempts", {
  key: text("key").primaryKey(),
  failures: integer("failures").notNull().default(0),
  windowStartedAt: integer("window_started_at").notNull(),
  blockedUntil: integer("blocked_until").notNull().default(0),
  updatedAt: integer("updated_at").notNull(),
});

export const workspacePages = sqliteTable("workspace_pages", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  area: text("area", { enum: ["memoria", "raciocinio", "conexoes"] }).notNull().default("memoria"),
  title: text("title").notNull(),
  content: text("content").notNull().default(""),
  icon: text("icon").notNull().default("📝"),
  favorite: integer("favorite", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  index("idx_workspace_pages_user_area_updated").on(table.userId, table.area, table.updatedAt),
]);

export const userPreferences = sqliteTable("user_preferences", {
  userId: text("user_id").primaryKey(),
  defaultArea: text("default_area", { enum: ["memoria", "raciocinio", "conexoes", "agenda"] }).notNull().default("memoria"),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const agendaItems = sqliteTable("agenda_items", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  notes: text("notes").notNull().default(""),
  date: text("date").notNull(),
  startTime: text("start_time"),
  endTime: text("end_time"),
  kind: text("kind", { enum: ["task", "event"] }).notNull().default("task"),
  color: text("color", { enum: ["violet", "cyan", "green", "amber", "coral"] }).notNull().default("violet"),
  done: integer("done", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  index("idx_agenda_items_user_date").on(table.userId, table.date),
]);
