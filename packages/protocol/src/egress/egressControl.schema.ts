import { z } from "zod";

import { RunIdSchema } from "../common/identifiers.schema.ts";

export const AllowlistRequestSchema = z.object({
  sourceIp: z.string().min(1),
  runId: RunIdSchema,
  hosts: z.array(z.string().min(1)),
});

export const RevokeAllowlistRequestSchema = z.object({ sourceIp: z.string().min(1) });

export const BlockedEgressSchema = z.object({ runId: RunIdSchema, host: z.string() });

export const BlockedEgressReportSchema = z.object({ blocked: z.array(BlockedEgressSchema) });

export type AllowlistRequest = z.input<typeof AllowlistRequestSchema>;
