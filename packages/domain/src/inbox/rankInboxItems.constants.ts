import type { InboxItemKind } from "./InboxItem.ts";

export const KIND_PRIORITY = {
  approval: 0,
  question: 1,
  escalation: 2,
  review: 3,
} as const satisfies Readonly<Record<InboxItemKind, number>>;

export const BLOCKING_PRIORITY = 0;
export const NON_BLOCKING_PRIORITY = 1;
