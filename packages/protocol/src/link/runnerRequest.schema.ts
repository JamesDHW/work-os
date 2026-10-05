import { z } from "zod";

import type { RunnerRequest } from "@work-os/domain/runners/RunnerRequest";

import { RunIdSchema } from "../common/identifiers.schema.ts";
import { JsonObjectSchema } from "../common/json.schema.ts";

const HostCredentialSchema = z.object({ username: z.string(), secret: z.string() });

export const RunnerRequestSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("prepareEnvironment"),
    runId: RunIdSchema,
    projectPath: z.string().min(1),
    devcontainer: JsonObjectSchema,
    egress: z.array(z.string()),
  }),
  z.object({ kind: z.literal("stopEnvironment"), runId: RunIdSchema }),
  z.object({
    kind: z.literal("exec"),
    runId: RunIdSchema,
    command: z.string(),
    stdin: z.string().optional(),
    cwd: z.string().optional(),
    timeoutSeconds: z.number().int().positive(),
    streamsOutput: z.literal(true).optional(),
  }),
  z.object({ kind: z.literal("collectChanges"), runId: RunIdSchema }),
  z.object({
    kind: z.literal("hostCommand"),
    projectPath: z.string().min(1),
    program: z.literal("git"),
    arguments: z.array(z.string()),
    credential: HostCredentialSchema.optional(),
  }),
  z.object({ kind: z.literal("listFolders"), path: z.string().optional() }),
]) satisfies z.ZodType<RunnerRequest>;
