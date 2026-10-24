import { tryCatchAsync } from "@work-os/shared/tryCatch";
import { WorkOsError } from "@work-os/shared/WorkOsError";
import { mkdir, rm, writeFile } from "fs/promises";
import { dirname } from "path";

export const writeServiceFile = async (path: string, contents: string): Promise<WorkOsError | undefined> => {
  const written = await tryCatchAsync(async () => {
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, contents);
  });
  return written instanceof WorkOsError ? written : undefined;
};

export const removeServiceFile = async (path: string): Promise<WorkOsError | undefined> => {
  const removed = await tryCatchAsync(() => rm(path, { force: true }));
  return removed instanceof WorkOsError ? removed : undefined;
};
