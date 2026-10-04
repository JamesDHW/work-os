import type { FolderEntry, RunnerResult } from "@work-os/domain/runners/RunnerResult";
import { NotFoundError } from "@work-os/shared/NotFoundError";
import { tryCatchAsync } from "@work-os/shared/tryCatch";
import { WorkOsError } from "@work-os/shared/WorkOsError";
import { access, readdir } from "fs/promises";
import { homedir } from "os";
import { dirname, join, resolve } from "path";

export type FolderListing = Extract<RunnerResult, { readonly kind: "listFolders" }>;

export const listFolders = async (requestedPath: string | undefined): Promise<FolderListing | WorkOsError> => {
  const path = resolve(requestedPath ?? homedir());
  const entries = await tryCatchAsync(() => readdir(path, { withFileTypes: true }));
  if (entries instanceof WorkOsError) return new NotFoundError(`Cannot open ${path}.`, { cause: entries });

  const visibleFolders = entries.filter((entry) => entry.isDirectory() && !entry.name.startsWith("."));
  const folders = await Promise.all(visibleFolders.map((entry) => describeFolder(join(path, entry.name), entry.name)));
  const parentPath = dirname(path) === path ? null : dirname(path);
  return { kind: "listFolders", path, parentPath, folders: folders.toSorted((first, second) => first.name.localeCompare(second.name)) };
};

const describeFolder = async (path: string, name: string): Promise<FolderEntry> => {
  const gitFolder = await tryCatchAsync(() => access(join(path, ".git")));
  return { name, path, isGitRepository: !(gitFolder instanceof WorkOsError) };
};
