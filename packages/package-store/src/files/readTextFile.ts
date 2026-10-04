import { NotFoundError } from "@work-os/shared/NotFoundError";
import { tryCatchAsync } from "@work-os/shared/tryCatch";
import { WorkOsError } from "@work-os/shared/WorkOsError";
import { readFile } from "fs/promises";

export const readTextFile = async (path: string): Promise<string | NotFoundError | WorkOsError> => {
  const text = await tryCatchAsync(() => readFile(path, "utf8"));
  if (text instanceof WorkOsError) return new NotFoundError(`Could not read ${path}.`, { cause: text });

  return text;
};
