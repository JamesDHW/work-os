import { z } from "zod";

export const ErrorBodySchema = z
  .object({
    error: z.object({
      code: z.string(),
      message: z.string(),
    }),
  })
  .meta({ id: "ErrorBody" });

export type ErrorBody = z.infer<typeof ErrorBodySchema>;
