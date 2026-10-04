import { z } from "zod";

export const WorkspaceManifestSchema = z.object({
  name: z.string().min(1),
  extends: z.array(z.string().min(1)).default([]),
  models: z.record(z.string(), z.string()).default({}),
  defaultEnvironment: z.string().exactOptional(),
});

export type WorkspaceManifest = z.infer<typeof WorkspaceManifestSchema>;
