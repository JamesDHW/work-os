import type { JsonObject } from "@work-os/domain/json/Json";
import type { ObservationKind } from "@work-os/domain/observations/Observation";
import { index, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const observations = sqliteTable(
  "observations",
  {
    id: text("id").primaryKey(),
    workspaceId: text("workspace_id").notNull(),
    runId: text("run_id").notNull(),
    kind: text("kind").$type<ObservationKind>().notNull(),
    detail: text("detail", { mode: "json" }).$type<JsonObject>().notNull(),
    createdAt: text("created_at").notNull(),
  },
  (table) => [index("observations_run_kind").on(table.runId, table.kind)],
);
