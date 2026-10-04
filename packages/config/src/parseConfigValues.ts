import type { z } from "zod";

import { ConfigError } from "./ConfigError.ts";

export const parseConfigValues = <Output>(schema: z.ZodType<Output>, values: unknown): Output | ConfigError => {
  const parsed = schema.safeParse(values);
  if (parsed.success) return parsed.data;

  const problems = parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`);
  return new ConfigError(`Invalid configuration. ${problems.join("; ")}`);
};
