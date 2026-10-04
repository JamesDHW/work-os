import type { ClosedInboxItemState, InboxStore } from "@work-os/core/inbox/InboxStore";
import { toInboxItemId, toRunId, toWorkspaceId } from "@work-os/domain/identifiers/Identifiers";
import type { InboxItemId, RunId, WorkspaceId } from "@work-os/domain/identifiers/Identifiers";
import type { InboxItem, InboxOrigin } from "@work-os/domain/inbox/InboxItem";
import { ConflictError } from "@work-os/shared/ConflictError";
import { NotFoundError } from "@work-os/shared/NotFoundError";
import { tryCatchAsync } from "@work-os/shared/tryCatch";
import { WorkOsError } from "@work-os/shared/WorkOsError";
import { and, desc, eq } from "drizzle-orm";

import { inboxItems } from "../tables/inboxItems.ts";
import type { WorkOsDatabase } from "../WorkOsDatabase.ts";
import { INBOX_LIST_LIMIT } from "./inbox.constants.ts";

type InboxItemRow = typeof inboxItems.$inferSelect;

export const createInboxStore = (database: WorkOsDatabase): InboxStore => {
  const selectItems = async (condition: ReturnType<typeof and>): Promise<readonly InboxItem[] | WorkOsError> => {
    const rows = await tryCatchAsync(() =>
      database.select().from(inboxItems).where(condition).orderBy(desc(inboxItems.createdAt)).limit(INBOX_LIST_LIMIT),
    );
    if (rows instanceof WorkOsError) return rows;

    return rows.map(toInboxItem);
  };

  const createInboxItem = async (inboxItem: InboxItem): Promise<InboxItem | WorkOsError> => {
    const row = { ...inboxItem, taskId: taskIdOf(inboxItem.origin), status: inboxItem.state.status };
    const inserted = await tryCatchAsync(() => database.insert(inboxItems).values(row));
    if (inserted instanceof WorkOsError) return inserted;

    return inboxItem;
  };

  const findInboxItem = async (workspaceId: WorkspaceId, inboxItemId: InboxItemId): Promise<InboxItem | WorkOsError> => {
    const found = await selectItems(and(eq(inboxItems.workspaceId, workspaceId), eq(inboxItems.id, inboxItemId)));
    if (found instanceof WorkOsError) return found;

    const inboxItem = found[0];
    if (inboxItem === undefined) return new NotFoundError(`Inbox item ${inboxItemId} does not exist.`);
    return inboxItem;
  };

  const findInboxItemByTask = async (taskId: string): Promise<InboxItem | null | WorkOsError> => {
    const found = await selectItems(and(eq(inboxItems.taskId, taskId)));
    if (found instanceof WorkOsError) return found;

    return found[0] ?? null;
  };

  const listInboxItems = async (workspaceId: WorkspaceId): Promise<readonly InboxItem[] | WorkOsError> => {
    return selectItems(and(eq(inboxItems.workspaceId, workspaceId)));
  };

  const listOpenRunItems = async (runId: RunId): Promise<readonly InboxItem[] | WorkOsError> => {
    return selectItems(and(eq(inboxItems.runId, runId), eq(inboxItems.status, "open")));
  };

  const closeInboxItem = async (inboxItemId: InboxItemId, state: ClosedInboxItemState): Promise<InboxItem | WorkOsError> => {
    const condition = and(eq(inboxItems.id, inboxItemId), eq(inboxItems.status, "open"));
    const rows = await tryCatchAsync(() =>
      database.update(inboxItems).set({ state, status: state.status }).where(condition).returning(),
    );
    if (rows instanceof WorkOsError) return rows;

    const row = rows[0];
    if (row === undefined) return new ConflictError("This inbox item was already answered or withdrawn.");
    return toInboxItem(row);
  };

  return { createInboxItem, findInboxItem, findInboxItemByTask, listInboxItems, listOpenRunItems, closeInboxItem };
};

const taskIdOf = (origin: InboxOrigin): string | null => {
  switch (origin.kind) {
    case "agentQuestion":
    case "capabilityApproval":
      return origin.taskId;
    case "runInput":
    case "runReview":
      return null;
    default:
      return origin satisfies never;
  }
};

const toInboxItem = (row: InboxItemRow): InboxItem => ({
  id: toInboxItemId(row.id),
  workspaceId: toWorkspaceId(row.workspaceId),
  runId: row.runId === null ? null : toRunId(row.runId),
  origin: row.origin,
  title: row.title,
  isBlocking: row.isBlocking,
  payload: row.payload,
  state: row.state,
  createdAt: row.createdAt,
});
