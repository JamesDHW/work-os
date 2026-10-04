import type { InboxItemState, InboxOrigin, InboxPayload } from "@work-os/domain/inbox/InboxItem";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const inboxItems = sqliteTable(
  "inbox_items",
  {
    id: text("id").primaryKey(),
    workspaceId: text("workspace_id").notNull(),
    runId: text("run_id"),
    origin: text("origin", { mode: "json" }).$type<InboxOrigin>().notNull(),
    taskId: text("task_id").unique(),
    title: text("title").notNull(),
    isBlocking: integer("is_blocking", { mode: "boolean" }).notNull(),
    payload: text("payload", { mode: "json" }).$type<InboxPayload>().notNull(),
    state: text("state", { mode: "json" }).$type<InboxItemState>().notNull(),
    status: text("status").$type<InboxItemState["status"]>().notNull(),
    createdAt: text("created_at").notNull(),
  },
  (table) => [index("inbox_items_workspace_status").on(table.workspaceId, table.status), index("inbox_items_run").on(table.runId)],
);
