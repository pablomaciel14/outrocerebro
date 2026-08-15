import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

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
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  index("idx_highlights_user_reading").on(table.userId, table.readingId),
]);
