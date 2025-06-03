import { int, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: int().primaryKey({autoIncrement: true}),
  email: text().notNull(),
  password: text().notNull(),
  createdAt: integer().notNull(),
  updatedAt: integer().notNull(),
  isActive: integer().notNull(),
});

export type InsertUser = typeof users.$inferInsert
export type User = typeof users.$inferSelect
