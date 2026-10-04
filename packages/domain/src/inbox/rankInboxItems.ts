import type { InboxItem } from "./InboxItem.ts";
import { BLOCKING_PRIORITY, KIND_PRIORITY, NON_BLOCKING_PRIORITY } from "./rankInboxItems.constants.ts";

export const rankInboxItems = (inboxItems: readonly InboxItem[]): readonly InboxItem[] => {
  return inboxItems.toSorted(compareInboxItems);
};

const compareInboxItems = (first: InboxItem, second: InboxItem): number => {
  const blockingOrder = blockingPriority(first) - blockingPriority(second);
  if (blockingOrder !== 0) return blockingOrder;

  const kindOrder = KIND_PRIORITY[first.payload.kind] - KIND_PRIORITY[second.payload.kind];
  if (kindOrder !== 0) return kindOrder;

  return first.createdAt.localeCompare(second.createdAt);
};

const blockingPriority = (inboxItem: InboxItem): number => {
  return inboxItem.isBlocking ? BLOCKING_PRIORITY : NON_BLOCKING_PRIORITY;
};
