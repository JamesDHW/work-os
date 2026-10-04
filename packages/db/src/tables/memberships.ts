import { primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const memberships = sqliteTable(
  "memberships",
  {
    workspaceId: text("workspace_id").notNull(),
    userId: text("user_id").notNull(),
    role: text("role").$type<"owner" | "member">().notNull(),
    createdAt: text("created_at").notNull(),
  },
  (table) => [primaryKey({ columns: [table.workspaceId, table.userId] })],
);
