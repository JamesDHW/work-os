import { z } from "zod";

export const RunnerCredentialsSchema = z.object({
  serverUrl: z.url(),
  runnerId: z.string().min(1),
  token: z.string().min(1),
});

export type RunnerCredentials = z.infer<typeof RunnerCredentialsSchema>;
