import { z } from "zod";

export const OpenAiModelListSchema = z.object({
  // oxlint-disable-next-line eslint/id-denylist -- OpenAI-compatible model lists name this field data.
  data: z.array(z.object({ id: z.string().min(1) })),
});
