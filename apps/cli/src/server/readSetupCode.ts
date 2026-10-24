import { tryCatch, tryCatchAsync } from "@work-os/shared/tryCatch";
import { WorkOsError } from "@work-os/shared/WorkOsError";
import { readFile } from "fs/promises";

/** The last setup code the server wrote to its log, or undefined when it has not announced one. */
export const readSetupCode = async (logFile: string): Promise<string | undefined> => {
  const text = await tryCatchAsync(() => readFile(logFile, "utf8"));
  if (text instanceof WorkOsError) return undefined;

  const codes = text.split("\n").map(setupCodeOf).filter((code): code is string => code !== undefined);
  return codes.at(-1);
};

const setupCodeOf = (line: string): string | undefined => {
  if (!line.includes('"setupCode"')) return undefined;

  const entry = tryCatch((): unknown => JSON.parse(line));
  if (!isLogEntry(entry)) return undefined;

  const { setupCode } = entry;
  return typeof setupCode === "string" ? setupCode : undefined;
};

const isLogEntry = (value: unknown): value is Readonly<Record<string, unknown>> => typeof value === "object" && value !== null && !Array.isArray(value);
