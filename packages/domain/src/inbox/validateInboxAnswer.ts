import { WorkOsError } from "@work-os/shared/WorkOsError";

import type { InboxAnswer, InboxAnswerKind } from "./InboxAnswer.ts";
import type { InboxItem, InboxPayload } from "./InboxItem.ts";
import { ANSWERS_BY_ITEM_KIND } from "./validateInboxAnswer.constants.ts";

export class InboxAnswerMismatchError extends WorkOsError {}
export class InboxItemClosedError extends WorkOsError {}

export const validateInboxAnswer = (
  inboxItem: InboxItem,
  answer: InboxAnswer,
): InboxAnswer | InboxAnswerMismatchError | InboxItemClosedError => {
  if (inboxItem.state.status !== "open") return new InboxItemClosedError(`Inbox inboxItem ${inboxItem.id} is ${inboxItem.state.status}.`);

  const allowedAnswers: readonly InboxAnswerKind[] = ANSWERS_BY_ITEM_KIND[inboxItem.payload.kind];
  if (!allowedAnswers.includes(answer.kind)) {
    return new InboxAnswerMismatchError(`A ${inboxItem.payload.kind} inboxItem cannot be answered with "${answer.kind}".`);
  }
  if (answer.kind === "approve") return validateApproval(inboxItem.payload, answer);

  return answer;
};

const validateApproval = (
  payload: InboxPayload,
  answer: Extract<InboxAnswer, { readonly kind: "approve" }>,
): InboxAnswer | InboxAnswerMismatchError => {
  if (payload.kind !== "approval") return new InboxAnswerMismatchError("Only approval items accept an approval.");
  if (!payload.durations.includes(answer.duration)) {
    return new InboxAnswerMismatchError(`Duration "${answer.duration}" is not offered for this action.`);
  }

  const editedFields = Object.keys(answer.editedArguments ?? {});
  const hasForbiddenEdit = editedFields.some((field) => !payload.editableFields.includes(field));
  if (hasForbiddenEdit) return new InboxAnswerMismatchError("Only the action's editable text fields can be changed.");

  return answer;
};
