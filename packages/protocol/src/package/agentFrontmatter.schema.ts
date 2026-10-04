import { z } from "zod";

import { AgentIdSchema } from "../common/identifiers.schema.ts";

export const ThinkingLevelSchema = z.enum(["off", "minimal", "low", "medium", "high"]);

export const AgentFrontmatterSchema = z.object({
  id: AgentIdSchema,
  name: z.string().min(1),
  model: z.string().min(1).default("default"),
  thinking: ThinkingLevelSchema.default("medium"),
  skills: z.array(z.string().min(1)).default([]),
});

export type AgentFrontmatter = z.infer<typeof AgentFrontmatterSchema>;
