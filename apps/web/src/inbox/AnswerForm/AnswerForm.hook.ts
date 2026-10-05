import { useRouter } from "@tanstack/react-router";
import { useState, type ChangeEvent } from "react";

import type { InboxAnswer, InboxItem } from "../../api/apiTypes.ts";
import { apiClient } from "../../api/client.ts";
import { describeFailure } from "../../api/describeFailure.ts";

export type ApprovalDuration = Extract<InboxAnswer, { readonly kind: "approve" }>["duration"];

export type AnswerFormModel = {
  readonly replyText: string;
  readonly editedFields: Readonly<Record<string, string>>;
  readonly errorMessage: string | null;
  readonly isBusy: boolean;
  readonly handleReplyChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
  readonly handleFieldChange: (field: string) => (event: ChangeEvent<HTMLTextAreaElement>) => void;
  readonly handleReplyClick: () => Promise<void>;
  readonly handleOptionClick: (option: string) => () => Promise<void>;
  readonly handleApproveClick: (duration: ApprovalDuration) => () => Promise<void>;
  readonly handleRejectClick: () => Promise<void>;
  readonly handleAcceptClick: () => Promise<void>;
  readonly handleRequestRevisionClick: () => Promise<void>;
  readonly handleAcknowledgeClick: () => Promise<void>;
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


  return {
    replyText,
    editedFields,
    errorMessage,
    isBusy,
    handleReplyChange: (event) => setReplyText(event.target.value),
    handleFieldChange: (field) => (event) => {
      const { value } = event.target;
      setEditedFields((previousFields) => ({ ...previousFields, [field]: value }));
    },
    handleReplyClick: async () => submitAnswer({ kind: "reply", text: replyText }),
    handleOptionClick: (option) => async () => submitAnswer({ kind: "reply", text: option }),
    handleApproveClick: (duration) => async () => submitAnswer({ kind: "approve", duration, editedArguments: editedFields }),
    handleRejectClick: async () => submitAnswer({ kind: "reject", reason: replyText }),
    handleAcceptClick: async () => submitAnswer({ kind: "accept" }),
    handleRequestRevisionClick: async () => submitAnswer({ kind: "requestRevision", comment: replyText }),
    handleAcknowledgeClick: async () => submitAnswer({ kind: "acknowledge" }),
  };
};

const initialFields = (inboxItem: InboxItem): Readonly<Record<string, string>> => {
  if (inboxItem.payload.kind !== "approval") return {};

  const { arguments: callArguments, editableFields } = inboxItem.payload;
  return Object.fromEntries(editableFields.map((field) => [field, String(callArguments[field] ?? "")]));
};
