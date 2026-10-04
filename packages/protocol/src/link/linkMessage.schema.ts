import { z } from "zod";

import { RunIdSchema } from "../common/identifiers.schema.ts";
import { RunnerRequestSchema } from "./runnerRequest.schema.ts";
import { RunnerResultSchema } from "./runnerResult.schema.ts";

const RequestIdSchema = z.string().min(1).max(100);

export const ServerLinkMessageSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("request"), requestId: RequestIdSchema, request: RunnerRequestSchema }),
]);

export const RunnerLinkMessageSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("hello"), name: z.string().min(1).max(100), platform: z.enum(["darwin", "linux", "windows"]) }),
  z.object({ type: z.literal("succeeded"), requestId: RequestIdSchema, result: RunnerResultSchema }),
  z.object({ type: z.literal("failed"), requestId: RequestIdSchema, message: z.string() }),
  z.object({ type: z.literal("output"), requestId: RequestIdSchema, chunk: z.string() }),
  z.object({ type: z.literal("egressBlocked"), runId: RunIdSchema, host: z.string() }),
]);

export type ServerLinkMessage = z.input<typeof ServerLinkMessageSchema>;
export type RunnerLinkMessage = z.output<typeof RunnerLinkMessageSchema>;
