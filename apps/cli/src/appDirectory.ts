import { managedAppDirectory } from "@work-os/config/ProfilePaths";
import { tryCatchAsync } from "@work-os/shared/tryCatch";
import { WorkOsError } from "@work-os/shared/WorkOsError";
import { stat } from "fs/promises";
import { join } from "path";

export type AppDirectoryInput = {
  readonly flag: string | undefined;
  readonly environment: Readonly<Record<string, string | undefined>>;
  readonly sourceRoot: string;
  readonly homeDirectory: string;
};

/**
 * The checkout the services run from: an explicit --app-dir or WORK_OS_APP_DIR, otherwise the checkout
 * this CLI runs inside, otherwise the checkout `work-os update` maintains under ~/.work-os/app.
 */
export const resolveAppDirectory = async (input: AppDirectoryInput): Promise<string> => {
  const explicit = input.flag ?? input.environment["WORK_OS_APP_DIR"];
  if (explicit !== undefined) return explicit;

  const isSourceCheckout = await isAppDirectory(input.sourceRoot);
  return isSourceCheckout ? input.sourceRoot : managedAppDirectory(input.homeDirectory);
};

export const isAppDirectory = async (directory: string): Promise<boolean> => {
  const entry = await tryCatchAsync(() => stat(join(directory, "apps", "server", "src", "main.ts")));
  return !(entry instanceof WorkOsError) && entry.isFile();
};
