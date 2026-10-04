import { InvalidRequestError } from "@work-os/shared/InvalidRequestError";
import { tryCatchAsync } from "@work-os/shared/tryCatch";
import { WorkOsError } from "@work-os/shared/WorkOsError";
import { stat } from "fs/promises";
import { isAbsolute, resolve } from "path";

export const requireProjectFolder = async (projectPath: string): Promise<string | WorkOsError> => {
  if (!isAbsolute(projectPath)) return new InvalidRequestError(`Project folders must be absolute paths, not "${projectPath}".`);

  const folder = resolve(projectPath);
  if (folder === "/") return new InvalidRequestError("The file system root cannot be a project folder.");

  const details = await tryCatchAsync(() => stat(folder));
  if (details instanceof WorkOsError) return new InvalidRequestError(`${folder} does not exist on this machine.`);
  if (!details.isDirectory()) return new InvalidRequestError(`${folder} is not a folder.`);
  return folder;
};
