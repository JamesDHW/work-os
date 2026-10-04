import type { WorkspaceKind } from "@work-os/domain/workspaces/Workspace";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const workspaces = sqliteTable("workspaces", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  kind: text("kind").$type<WorkspaceKind>().notNull(),
  createdAt: text("created_at").notNull(),
});
