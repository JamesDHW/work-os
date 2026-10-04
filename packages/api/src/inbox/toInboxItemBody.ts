import type { z } from "@hono/zod-openapi";
import type { InboxItem, InboxPayload } from "@work-os/domain/inbox/InboxItem";
import type { InboxItemSchema } from "@work-os/protocol/api/inbox.schema";

import { toOpaqueJson } from "../http/toOpaqueJson.ts";

export type InboxItemBody = z.output<typeof InboxItemSchema>;

export const toInboxItemBody = (inboxItem: InboxItem): InboxItemBody => ({
  id: inboxItem.id,
  runId: inboxItem.runId,
  title: inboxItem.title,
  isBlocking: inboxItem.isBlocking,
  payload: toPayloadBody(inboxItem.payload),
  status: inboxItem.state.status,
  answeredBy: inboxItem.state.status === "answered" ? inboxItem.state.answeredBy : null,
  createdAt: inboxItem.createdAt,
});

const toPayloadBody = (payload: InboxPayload): InboxItemBody["payload"] => {
  switch (payload.kind) {
    case "question":
      return { ...payload, options: [...payload.options] };
    case "approval":
      return {
        ...payload,
        arguments: toOpaqueJson(payload.arguments),
        editableFields: [...payload.editableFields],
        durations: [...payload.durations],
      };
    case "review":
    case "escalation":
      return payload;
    default:
      return payload satisfies never;
  }
};
