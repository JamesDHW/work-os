import { z } from "zod";

import { JsonValueSchema } from "../common/json.schema.ts";

const WorkOsCustomizationsSchema = z.object({
  egress: z.array(z.string().min(1)).default([]),
});

export const DevcontainerSchema = z
  .object({
    customizations: z
      .object({
        workos: WorkOsCustomizationsSchema.exactOptional(),
      })
      .catchall(JsonValueSchema)
      .exactOptional(),
  })
  .catchall(JsonValueSchema);

export type Devcontainer = z.infer<typeof DevcontainerSchema>;
