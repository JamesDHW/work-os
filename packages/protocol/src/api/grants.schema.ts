import { z } from "zod";

import { CapabilityIdSchema, GrantIdSchema, RunIdSchema, StandardIdSchema, UserIdSchema } from "../common/identifiers.schema.ts";

export const GrantScopeSchema = z
  .discriminatedUnion("kind", [
    z.object({ kind: z.literal("run"), runId: RunIdSchema }),
    z.object({ kind: z.literal("standard"), standardId: StandardIdSchema }),
  ])
  .meta({ id: "GrantScope" });

export const GrantSchema = z
  .object({
    id: GrantIdSchema,
    capabilityId: CapabilityIdSchema,
    target: z.string(),
    scope: GrantScopeSchema,
    createdBy: UserIdSchema,
    createdAt: z.string(),
  })
  .meta({ id: "Grant" });

export const GrantParamsSchema = z.object({ grantId: GrantIdSchema });
