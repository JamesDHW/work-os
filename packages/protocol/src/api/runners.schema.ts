import { z } from "zod";

import { RunnerIdSchema } from "../common/identifiers.schema.ts";

const RunnerPlatformSchema = z.enum(["darwin", "linux", "windows"]);

export const RunnerSchema = z
  .object({
    id: RunnerIdSchema,
    name: z.string(),
    platform: RunnerPlatformSchema,
    isOnline: z.boolean(),
    lastSeenAt: z.string().nullable(),
    pairedAt: z.string(),
  })
  .meta({ id: "Runner" });

export const PairingCodeResponseSchema = z
  .object({ code: z.string(), expiresAt: z.string() })
  .meta({ id: "PairingCodeResponse" });

export const PairRunnerRequestSchema = z
  .object({ code: z.string().min(1), name: z.string().min(1).max(100), platform: RunnerPlatformSchema })
  .meta({ id: "PairRunnerRequest" });

export const PairRunnerResponseSchema = z
  .object({ runnerId: RunnerIdSchema, token: z.string() })
  .meta({ id: "PairRunnerResponse" });

export const FolderListingSchema = z
  .object({
    path: z.string(),
    parentPath: z.string().nullable(),
    folders: z.array(z.object({ name: z.string(), path: z.string(), isGitRepository: z.boolean() })),
  })
  .meta({ id: "FolderListing" });

export const RunnerParamsSchema = z.object({ runnerId: RunnerIdSchema });
export const FolderQuerySchema = z.object({ path: z.string().exactOptional() });
