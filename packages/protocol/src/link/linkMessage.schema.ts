import { z } from "zod";

import type { RunId } from "@work-os/domain/identifiers/Identifiers";
import type { RunnerResult } from "@work-os/domain/runners/RunnerResult";

import { RunIdSchema } from "../common/identifiers.schema.ts";
import { RunnerRequestSchema } from "./runnerRequest.schema.ts";
import { RunnerResultSchema } from "./runnerResult.schema.ts";

const RequestIdSchema = z.string().min(1).max(100);

export const ServerLinkMessageSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("request"), requestId: RequestIdSchema, request: RunnerRequestSchema }),
]);

export type RunnerLinkMessage =
  | { readonly type: "hello"; readonly token: string; readonly version: string }
  | { readonly type: "succeeded"; readonly requestId: string; readonly result: RunnerResult }
  | { readonly type: "failed"; readonly requestId: string; readonly message: string }
  | { readonly type: "output"; readonly requestId: string; readonly chunk: string }
  | { readonly type: "egressBlocked"; readonly runId: RunId; readonly host: string };

export const RunnerLinkMessageSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("hello"), token: z.string().min(1), version: z.string().min(1) }),
  z.object({ type: z.literal("succeeded"), requestId: RequestIdSchema, result: RunnerResultSchema }),
  z.object({ type: z.literal("failed"), requestId: RequestIdSchema, message: z.string() }),
  z.object({ type: z.literal("output"), requestId: RequestIdSchema, chunk: z.string() }),
  z.object({ type: z.literal("egressBlocked"), runId: RunIdSchema, host: z.string() }),
]) satisfies z.ZodType<RunnerLinkMessage>;

export type ServerLinkMessage = z.input<typeof ServerLinkMessageSchema>;
