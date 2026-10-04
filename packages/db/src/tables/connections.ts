import { index, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const connections = sqliteTable(
  "connections",
  {
    id: text("id").primaryKey(),
    workspaceId: text("workspace_id").notNull(),
    kind: text("kind").notNull(),
    label: text("label").notNull(),
    sealedSecret: text("sealed_secret").notNull(),
    createdAt: text("created_at").notNull(),
  },
  (table) => [index("connections_workspace").on(table.workspaceId)],
);
