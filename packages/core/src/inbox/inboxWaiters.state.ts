import type { InboxItemId } from "@work-os/domain/identifiers/Identifiers";
import type { InboxItemState } from "@work-os/domain/inbox/InboxItem";

import type { InboxWaiters } from "./InboxWaiters.ts";

export const createInboxWaiters = (): InboxWaiters => {
  const pendingByItem = new Map<InboxItemId, PromiseWithResolvers<InboxItemState>>();

  const waitForClose = (inboxItemId: InboxItemId): Promise<InboxItemState> => {
    const pending = pendingByItem.get(inboxItemId) ?? Promise.withResolvers<InboxItemState>();
    pendingByItem.set(inboxItemId, pending);
    return pending.promise;
  };

  const settle = (inboxItemId: InboxItemId, state: InboxItemState): void => {
    pendingByItem.get(inboxItemId)?.resolve(state);
    pendingByItem.delete(inboxItemId);
  };

  return { waitForClose, settle };
};
