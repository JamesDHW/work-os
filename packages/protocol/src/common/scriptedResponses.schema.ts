import { z } from "zod";

import { JsonObjectSchema } from "./json.schema.ts";

export const ScriptedResponsesSchema = z.array(
  z.object({
    text: z.string().default(""),
    toolCalls: z.array(z.object({ name: z.string().min(1), arguments: JsonObjectSchema })).default([]),
  }),
);
