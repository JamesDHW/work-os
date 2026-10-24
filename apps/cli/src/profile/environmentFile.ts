import { tryCatchAsync } from "@work-os/shared/tryCatch";
import { WorkOsError } from "@work-os/shared/WorkOsError";
import { mkdir, readFile, writeFile } from "fs/promises";
import { dirname } from "path";
import { parseEnv } from "util";

import { ENVIRONMENT_FILE_MODE, PROFILE_FOLDER_MODE } from "../cli.constants.ts";

export type EnvironmentValues = Readonly<Record<string, string>>;

/** The variables in a profile's settings file, or none when the file does not exist yet. */
export const readEnvironmentFile = async (path: string): Promise<EnvironmentValues | WorkOsError> => {
  const text = await tryCatchAsync(() => readFile(path, "utf8"));
  if (text instanceof WorkOsError) return isMissingFile(text) ? {} : text;

  const entries = Object.entries(parseEnv(text)).flatMap(([name, value]): readonly (readonly [string, string])[] => (value === undefined ? [] : [[name, value]]));
  return Object.fromEntries(entries);
};

/**
 * Sets variables in a settings file while keeping everything else in it: comments, ordering and the
 * variables the user added by hand. A variable that is already set keeps its line position.
 */
export const updateEnvironmentFile = async (path: string, updates: EnvironmentValues, header: string): Promise<WorkOsError | undefined> => {
  const existing = await tryCatchAsync(() => readFile(path, "utf8"));
  const text = existing instanceof WorkOsError ? header : existing;
  const written = await tryCatchAsync(async () => {
    await mkdir(dirname(path), { recursive: true, mode: PROFILE_FOLDER_MODE });
    await writeFile(path, renderEnvironmentFile(text, updates), { mode: ENVIRONMENT_FILE_MODE });
  });
  return written instanceof WorkOsError ? written : undefined;
};

export const renderEnvironmentFile = (text: string, updates: EnvironmentValues): string => {
  const lines = text.replace(/\n$/u, "").split("\n");
  const replaced = lines.map((line) => replaceAssignment(line, updates));
  const present = new Set(lines.map(assignedName).filter((name) => name !== undefined));
  const appended = Object.entries(updates)
    .filter(([name]) => !present.has(name))
    .map(([name, value]) => `${name}=${value}`);
  const body = [...replaced, ...appended].join("\n");
  return body.endsWith("\n") ? body : `${body}\n`;
};

const assignedName = (line: string): string | undefined => /^\s*(?:export\s+)?([A-Z_][A-Z0-9_]*)\s*=/u.exec(line)?.[1];

const replaceAssignment = (line: string, updates: EnvironmentValues): string => {
  const name = assignedName(line);
  if (name === undefined) return line;

  const value = updates[name];
  return value === undefined ? line : `${name}=${value}`;
};

const isMissingFile = (error: WorkOsError): boolean => error.cause instanceof Error && "code" in error.cause && error.cause.code === "ENOENT";
