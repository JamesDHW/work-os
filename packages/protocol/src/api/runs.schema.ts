import { z } from "zod";

import type { RunState } from "@work-os/domain/runs/RunState";

import { CapabilityIdSchema, ProjectIdSchema, RunIdSchema, StandardIdSchema } from "../common/identifiers.schema.ts";
import { OpaqueJsonObjectSchema } from "../common/json.schema.ts";

export const RunStateSchema = z
  .discriminatedUnion("status", [
    z.object({ status: z.literal("preparing") }),
    z.object({ status: z.literal("running") }),
    z.object({ status: z.literal("waiting"), reason: z.enum(["approval", "question", "input", "runnerOffline"]) }),
    z.object({ status: z.literal("checking") }),
    z.object({ status: z.literal("reviewing") }),
    z.object({ status: z.literal("completed"), outcome: z.enum(["accepted", "rejected", "unreviewed"]) }),
    z.object({ status: z.literal("failed"), message: z.string() }),
    z.object({ status: z.literal("stopped") }),
  ])
  .meta({ id: "RunState" }) satisfies z.ZodType<RunState>;

export const RunSummarySchema = z
  .object({
    id: RunIdSchema,
    projectId: ProjectIdSchema,
    standardId: StandardIdSchema,
    prompt: z.string(),
    state: RunStateSchema,
    summary: z.string().nullable(),
    createdAt: z.string(),
    updatedAt: z.string(),
  })
  .meta({ id: "RunSummary" });

export const TranscriptEntrySchema = z
  .object({
    id: z.string(),
    role: z.enum(["user", "assistant", "tool"]),
    text: z.string(),
    toolName: z.string().nullable(),
    isError: z.boolean(),
  })
  .meta({ id: "TranscriptEntry" });

export const ChangedFileSchema = z
  .object({ path: z.string(), change: z.enum(["added", "modified", "deleted"]) })
  .meta({ id: "ChangedFile" });

export const CapabilityCallRecordSchema = z
  .object({
    id: z.string(),
    capabilityId: CapabilityIdSchema,
    target: z.string(),
    arguments: OpaqueJsonObjectSchema,
    status: z.enum(["pending", "succeeded", "failed", "refused"]),
    result: z.string().nullable(),
    createdAt: z.string(),
  })
  .meta({ id: "CapabilityCallRecord" });

export const RunDetailSchema = z
  .object({
    run: RunSummarySchema,
    spec: OpaqueJsonObjectSchema,
    transcript: z.array(TranscriptEntrySchema),
    streamingText: z.string().nullable(),
    changedFiles: z.array(ChangedFileSchema),
    diff: z.string().nullable(),
    capabilityCalls: z.array(CapabilityCallRecordSchema),
    capabilities: z.array(CapabilityIdSchema),
  })
  .meta({ id: "RunDetail" });

export const StartRunRequestSchema = z
  .object({ projectId: ProjectIdSchema, standardId: StandardIdSchema, prompt: z.string().max(20_000) })
  .meta({ id: "StartRunRequest" });

export const SendRunMessageRequestSchema = z
  .object({ text: z.string().min(1).max(20_000), mode: z.enum(["steer", "followUp"]).default("followUp") })
  .meta({ id: "SendRunMessageRequest" });

export const AddRunCapabilityRequestSchema = z
  .object({ capabilityId: CapabilityIdSchema })
  .meta({ id: "AddRunCapabilityRequest" });

export const RunParamsSchema = z.object({ runId: RunIdSchema });
export const RunListQuerySchema = z.object({ projectId: ProjectIdSchema.exactOptional() });
