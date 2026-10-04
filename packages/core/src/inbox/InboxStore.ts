import type { InboxItemId, RunId, WorkspaceId } from "@work-os/domain/identifiers/Identifiers";
import type { InboxItem, InboxItemState } from "@work-os/domain/inbox/InboxItem";
import type { ConflictError } from "@work-os/shared/ConflictError";
import type { NotFoundError } from "@work-os/shared/NotFoundError";
import type { WorkOsError } from "@work-os/shared/WorkOsError";

export type ClosedInboxItemState = Exclude<InboxItemState, { readonly status: "open" }>;

export type InboxStore = {
  readonly createInboxItem: (inboxItem: InboxItem) => Promise<InboxItem | WorkOsError>;
  readonly findInboxItem: (workspaceId: WorkspaceId, inboxItemId: InboxItemId) => Promise<InboxItem | NotFoundError | WorkOsError>;
  readonly findInboxItemByTask: (taskId: string) => Promise<InboxItem | null | WorkOsError>;
  readonly listInboxItems: (workspaceId: WorkspaceId) => Promise<readonly InboxItem[] | WorkOsError>;
  readonly listOpenRunItems: (runId: RunId) => Promise<readonly InboxItem[] | WorkOsError>;
  readonly closeInboxItem: (
    inboxItemId: InboxItemId,
    state: ClosedInboxItemState,
  ) => Promise<InboxItem | ConflictError | WorkOsError>;
};
