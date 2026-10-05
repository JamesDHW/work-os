import { z } from "zod";

import { AgentIdSchema, CapabilityIdSchema, StandardIdSchema } from "../common/identifiers.schema.ts";

export const CheckSchema = z.object({
  name: z.string().min(1),
  command: z.string().min(1),
});

export const ReviewPolicySchema = z.enum(["required", "optional", "none"]);

export const StandardFrontmatterSchema = z.object({
  id: StandardIdSchema,
  describes: z.string().min(1),
  consumer: z.string().min(1),
  agent: AgentIdSchema,
  skills: z.array(z.string().min(1)).default([]),
  capabilities: z.array(CapabilityIdSchema).default([]),
  egress: z.array(z.string().min(1)).default([]),
  checks: z.array(CheckSchema).default([]),
  review: ReviewPolicySchema.default("required"),
  input: z.string().optional(),
});

export type StandardFrontmatter = z.infer<typeof StandardFrontmatterSchema>;
