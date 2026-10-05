import { z } from "zod";

import type { InboxAnswer } from "@work-os/domain/inbox/InboxAnswer";

import { CapabilityIdSchema, InboxItemIdSchema, RunIdSchema, UserIdSchema } from "../common/identifiers.schema.ts";
import { OpaqueJsonObjectSchema } from "../common/json.schema.ts";

const GrantDurationSchema = z.enum(["once", "run", "standard"]);

export const InboxPayloadSchema = z
  .discriminatedUnion("kind", [
    z.object({ kind: z.literal("question"), question: z.string(), options: z.array(z.string()) }),
    z.object({
      kind: z.literal("approval"),
      capabilityId: CapabilityIdSchema,
      target: z.string(),
      arguments: OpaqueJsonObjectSchema,
      editableFields: z.array(z.string()),
      durations: z.array(GrantDurationSchema),
    }),
    z.object({ kind: z.literal("review"), summary: z.string(), changedFileCount: z.number().int() }),
    z.object({ kind: z.literal("escalation"), reason: z.string() }),
  ])
  .meta({ id: "InboxPayload" });

export const InboxAnswerSchema = z
  .discriminatedUnion("kind", [
    z.object({ kind: z.literal("reply"), text: z.string().min(1) }),
    z.object({ kind: z.literal("approve"), duration: GrantDurationSchema, editedArguments: z.record(z.string(), z.string()).optional() }),
    z.object({ kind: z.literal("reject"), reason: z.string().optional() }),
    z.object({ kind: z.literal("accept") }),
    z.object({ kind: z.literal("requestRevision"), comment: z.string().min(1) }),
    z.object({ kind: z.literal("acknowledge") }),
  ])
  .meta({ id: "InboxAnswer" }) satisfies z.ZodType<InboxAnswer>;

export const InboxItemSchema = z
  .object({
    id: InboxItemIdSchema,
    runId: RunIdSchema.nullable(),
    title: z.string(),
    isBlocking: z.boolean(),
    payload: InboxPayloadSchema,
    status: z.enum(["open", "answered", "withdrawn"]),
    answeredBy: UserIdSchema.nullable(),
    createdAt: z.string(),
  })
  .meta({ id: "InboxItem" });

export const AnswerInboxItemRequestSchema = z.object({ answer: InboxAnswerSchema }).meta({ id: "AnswerInboxItemRequest" });
export const InboxItemParamsSchema = z.object({ inboxItemId: InboxItemIdSchema });
