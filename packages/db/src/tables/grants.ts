import type { GrantScope } from "@work-os/domain/capabilities/Grant";
import { index, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const grants = sqliteTable(
  "grants",
  {
    id: text("id").primaryKey(),
    workspaceId: text("workspace_id").notNull(),
    capabilityId: text("capability_id").notNull(),
    target: text("target").notNull(),
    scope: text("scope", { mode: "json" }).$type<GrantScope>().notNull(),
    createdBy: text("created_by").notNull(),
    createdAt: text("created_at").notNull(),
  },
  (table) => [index("grants_workspace").on(table.workspaceId)],
);
