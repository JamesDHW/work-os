import type { InboxAnswerKind } from "./InboxAnswer.ts";
import type { InboxItemKind } from "./InboxItem.ts";

export const ANSWERS_BY_ITEM_KIND = {
  question: ["reply"],
  approval: ["approve", "reject"],
  review: ["accept", "requestRevision", "reject"],
  escalation: ["acknowledge", "reply"],
} as const satisfies Readonly<Record<InboxItemKind, readonly InboxAnswerKind[]>>;
