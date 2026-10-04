import type { Run, RunOutputs } from "@work-os/domain/runs/Run";
import type { RunSpec } from "@work-os/domain/runs/RunSpec";
import type { RunState } from "@work-os/domain/runs/RunState";
import { index, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const runs = sqliteTable(
  "runs",
  {
    id: text("id").primaryKey(),
    workspaceId: text("workspace_id").notNull(),
    projectId: text("project_id").notNull(),
    standardId: text("standard_id").notNull(),
    principal: text("principal", { mode: "json" }).$type<Run["principal"]>().notNull(),
    spec: text("spec", { mode: "json" }).$type<RunSpec>().notNull(),
    addedCapabilities: text("added_capabilities", { mode: "json" }).$type<Run["addedCapabilities"]>().notNull(),
    state: text("state", { mode: "json" }).$type<RunState>().notNull(),
    status: text("status").$type<RunState["status"]>().notNull(),
    summary: text("summary"),
    outputs: text("outputs", { mode: "json" }).$type<RunOutputs>(),
    conversationId: text("conversation_id"),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [index("runs_workspace_created").on(table.workspaceId, table.createdAt), index("runs_status").on(table.status)],
);
