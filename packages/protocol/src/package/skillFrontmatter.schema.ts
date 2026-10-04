import { z } from "zod";

export const SkillFrontmatterSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
});

export type SkillFrontmatter = z.infer<typeof SkillFrontmatterSchema>;
