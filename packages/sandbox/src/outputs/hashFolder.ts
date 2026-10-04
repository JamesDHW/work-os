import type { FileManifest } from "@work-os/domain/runs/ChangedFile";
import { tryCatchAsync } from "@work-os/shared/tryCatch";
import { WorkOsError } from "@work-os/shared/WorkOsError";
import { createHash } from "crypto";
import { readdir, readFile, stat } from "fs/promises";
import { join, relative } from "path";

import { HASHED_FILE_SIZE_LIMIT, MANIFEST_SKIPPED_FOLDERS } from "../sandbox.constants.ts";

export const hashFolder = async (root: string): Promise<FileManifest | WorkOsError> => {
  const entries = await tryCatchAsync(() => readdir(root, { recursive: true, withFileTypes: true }));
  if (entries instanceof WorkOsError) return entries;

  const files = entries.filter((entry) => entry.isFile()).map((entry) => join(entry.parentPath, entry.name));
  const included = files.map((path) => relative(root, path)).filter(isIncluded);
  const hashes = await Promise.all(included.map(async (path) => [path, await fingerprint(join(root, path))] as const));
  return Object.fromEntries(hashes);
};

const isIncluded = (relativePath: string): boolean => {
  const segments = relativePath.split("/");
  return !segments.some((segment) => MANIFEST_SKIPPED_FOLDERS.includes(segment));
};

const fingerprint = async (path: string): Promise<string> => {
  const details = await tryCatchAsync(() => stat(path));
  if (details instanceof WorkOsError) return "unreadable";
  if (details.size > HASHED_FILE_SIZE_LIMIT) return `size:${details.size}:mtime:${details.mtimeMs}`;

  const content = await tryCatchAsync(() => readFile(path));
  if (content instanceof WorkOsError) return "unreadable";
  return createHash("sha256").update(content).digest("hex");
};
