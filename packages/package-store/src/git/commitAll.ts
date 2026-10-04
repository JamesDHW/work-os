import { WorkOsError } from "@work-os/shared/WorkOsError";

import { runGit } from "./runGit.ts";

export const commitAll = async (directory: string, message: string): Promise<string | WorkOsError> => {
  const added = await runGit(directory, ["add", "--all"]);
  if (added instanceof WorkOsError) return added;

  const status = await runGit(directory, ["status", "--porcelain"]);
  if (status instanceof WorkOsError) return status;

  const hasChanges = status.length > 0;
  if (hasChanges) {
    const committed = await runGit(directory, ["commit", "--quiet", "--message", message]);
    if (committed instanceof WorkOsError) return committed;
  }
  return runGit(directory, ["rev-parse", "HEAD"]);
};
