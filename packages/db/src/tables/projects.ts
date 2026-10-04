import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const projects = sqliteTable("projects", {
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull(),
  name: text("name").notNull(),
  runnerId: text("runner_id").notNull(),
  path: text("path").notNull(),
  environmentId: text("environment_id").notNull(),
  connectionIds: text("connection_ids", { mode: "json" }).$type<readonly string[]>().notNull(),
  createdAt: text("created_at").notNull(),
});
