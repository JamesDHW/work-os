import type { JsonObject } from "@work-os/domain/json/Json";
import type { CapabilityCallStatus } from "@work-os/core/capabilities/CapabilityCallStore";
import { index, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const capabilityCalls = sqliteTable(
  "capability_calls",
  {
    id: text("id").primaryKey(),
    workspaceId: text("workspace_id").notNull(),
    runId: text("run_id").notNull(),
    capabilityId: text("capability_id").notNull(),
    target: text("target").notNull(),
    arguments: text("arguments", { mode: "json" }).$type<JsonObject>().notNull(),
    status: text("status").$type<CapabilityCallStatus>().notNull(),
    result: text("result"),
    createdAt: text("created_at").notNull(),
  },
  (table) => [index("capability_calls_run").on(table.runId)],
);
