import type { RunId, WorkspaceId } from "@work-os/domain/identifiers/Identifiers";
import type { Run } from "@work-os/domain/runs/Run";
import { NotFoundError } from "@work-os/shared/NotFoundError";
import { WorkOsError } from "@work-os/shared/WorkOsError";

import type { RunStore } from "./RunStore.ts";

export const findWorkspaceRun = async (
  runStore: Pick<RunStore, "findRun">,
  workspaceId: WorkspaceId,
  runId: RunId,
): Promise<Run | WorkOsError> => {
  const run = await runStore.findRun(runId);
  if (run instanceof WorkOsError) return run;
  if (run.workspaceId !== workspaceId) return new NotFoundError(`Run ${runId} does not exist.`);

  return run;
};
