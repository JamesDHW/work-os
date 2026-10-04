import { z } from "zod";

import type { RunnerResult } from "@work-os/domain/runners/RunnerResult";

const ChangedFileSchema = z.object({ path: z.string(), change: z.enum(["added", "modified", "deleted"]) });
const FolderEntrySchema = z.object({ name: z.string(), path: z.string(), isGitRepository: z.boolean() });
const commandOutcome = { exitCode: z.number().int(), output: z.string(), isTimedOut: z.boolean() };

export const RunnerResultSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("prepareEnvironment"), workspacePath: z.string() }),
  z.object({ kind: z.literal("stopEnvironment") }),
  z.object({ kind: z.literal("exec"), ...commandOutcome }),
  z.object({ kind: z.literal("collectChanges"), changedFiles: z.array(ChangedFileSchema), diff: z.string().nullable() }),
  z.object({ kind: z.literal("hostCommand"), ...commandOutcome }),
  z.object({
    kind: z.literal("listFolders"),
    path: z.string(),
    parentPath: z.string().nullable(),
    folders: z.array(FolderEntrySchema),
  }),
]) satisfies z.ZodType<RunnerResult>;
