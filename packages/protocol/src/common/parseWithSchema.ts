import { InvalidRequestError } from "@work-os/shared/InvalidRequestError";
import type { z } from "zod";

export const parseWithSchema = <Output>(schema: z.ZodType<Output>, value: unknown, subject: string): Output | InvalidRequestError => {
  const parsed = schema.safeParse(value);
  if (parsed.success) return parsed.data;

  const problems = parsed.error.issues.map((issue) => `${describePath(issue.path)}: ${issue.message}`);
  return new InvalidRequestError(`${subject} is invalid. ${problems.join("; ")}`);
};

const describePath = (path: readonly PropertyKey[]): string => {
  if (path.length === 0) return "(root)";

  return path.map(String).join(".");
};
