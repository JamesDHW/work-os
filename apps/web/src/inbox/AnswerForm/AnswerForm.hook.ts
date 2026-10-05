import { useRouter } from "@tanstack/react-router";
import { useState, type ChangeEvent, type MouseEvent } from "react";

import type { InboxAnswer, InboxItem } from "../../api/apiTypes.ts";
import { apiClient } from "../../api/client.ts";
import { describeFailure } from "../../api/describeFailure.ts";
import { startAction } from "../../api/startAction.ts";
import { APPROVAL_DURATIONS } from "../inbox.constants.ts";

export type AnswerFormModel = {
  readonly replyText: string;
  readonly editedFields: Readonly<Record<string, string>>;
  readonly errorMessage: string | null;
  readonly isBusy: boolean;
  readonly handleReplyChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
  readonly handleFieldChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
  readonly handleReplyClick: () => void;
  readonly handleOptionClick: (event: MouseEvent<HTMLButtonElement>) => void;
  readonly handleApproveClick: (event: MouseEvent<HTMLButtonElement>) => void;
  readonly handleRejectClick: () => void;
  readonly handleAcceptClick: () => void;
  readonly handleRequestRevisionClick: () => void;
  readonly handleAcknowledgeClick: () => void;
};

export const useAnswerForm = (workspaceId: string, inboxItem: InboxItem): AnswerFormModel => {
  const router = useRouter();
  const [replyText, setReplyText] = useState("");
  const [editedFields, setEditedFields] = useState<Readonly<Record<string, string>>>(() => initialFields(inboxItem));
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  const submitAnswer = async (answer: InboxAnswer): Promise<void> => {
    setIsBusy(true);
    const params = { path: { workspaceId, inboxItemId: inboxItem.id } };
    const result = await apiClient.POST("/api/w/{workspaceId}/inbox/{inboxItemId}/answer", { params, body: { answer } });
    setIsBusy(false);
    setErrorMessage(describeFailure(result));
    await router.invalidate();
  };

  const approve = async (event: MouseEvent<HTMLButtonElement>): Promise<void> => {
    const chosenValue = event.currentTarget.value;
    const duration = APPROVAL_DURATIONS.find((candidate) => candidate === chosenValue);
    if (duration === undefined) return;

    await submitAnswer({ kind: "approve", duration, editedArguments: editedFields });
  };

  return {
    replyText,
    editedFields,
    errorMessage,
    isBusy,
    handleReplyChange: (event) => setReplyText(event.target.value),
    handleFieldChange: (event) => {
      const { name, value } = event.target;
      setEditedFields((previousFields) => ({ ...previousFields, [name]: value }));
    },
    handleReplyClick: startAction(async () => submitAnswer({ kind: "reply", text: replyText })),
    handleOptionClick: startAction(async (event: MouseEvent<HTMLButtonElement>) => submitAnswer({ kind: "reply", text: event.currentTarget.value })),
    handleApproveClick: startAction(approve),
    handleRejectClick: startAction(async () => submitAnswer({ kind: "reject", reason: replyText })),
    handleAcceptClick: startAction(async () => submitAnswer({ kind: "accept" })),
    handleRequestRevisionClick: startAction(async () => submitAnswer({ kind: "requestRevision", comment: replyText })),
    handleAcknowledgeClick: startAction(async () => submitAnswer({ kind: "acknowledge" })),
  };
};

const initialFields = (inboxItem: InboxItem): Readonly<Record<string, string>> => {
  if (inboxItem.payload.kind !== "approval") return {};

  const { arguments: callArguments, editableFields } = inboxItem.payload;
  return Object.fromEntries(editableFields.map((field) => [field, String(callArguments[field] ?? "")]));
};
