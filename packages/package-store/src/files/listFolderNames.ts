import { tryCatchAsync } from "@work-os/shared/tryCatch";
import { WorkOsError } from "@work-os/shared/WorkOsError";
import { readdir } from "fs/promises";

export const listFolderNames = async (path: string): Promise<readonly string[]> => {
  const entries = await tryCatchAsync(() => readdir(path, { withFileTypes: true }));
  if (entries instanceof WorkOsError) return [];

  return entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name).toSorted();
};
