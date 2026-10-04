import type { WorkspaceId } from "@work-os/domain/identifiers/Identifiers";
import type { InboxItem } from "@work-os/domain/inbox/InboxItem";
import { rankInboxItems } from "@work-os/domain/inbox/rankInboxItems";
import { WorkOsError } from "@work-os/shared/WorkOsError";

import type { InboxStore } from "./InboxStore.ts";

type ListInboxDependencies = {
  readonly inboxStore: Pick<InboxStore, "listInboxItems">;
};

export type ListInbox = (workspaceId: WorkspaceId) => Promise<readonly InboxItem[] | WorkOsError>;

export const createListInbox = (dependencies: ListInboxDependencies): ListInbox => {
  return async (workspaceId) => {
    const inboxItems = await dependencies.inboxStore.listInboxItems(workspaceId);
    if (inboxItems instanceof WorkOsError) return inboxItems;

    return rankInboxItems(inboxItems);
  };
};
