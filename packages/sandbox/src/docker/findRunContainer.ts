import type { RunId } from "@work-os/domain/identifiers/Identifiers";
import { NotFoundError } from "@work-os/shared/NotFoundError";
import { WorkOsError } from "@work-os/shared/WorkOsError";

import { RUN_LABEL } from "../sandbox.constants.ts";
import { runDockerExpectingSuccess } from "./runDocker.ts";

export const findRunContainer = async (runId: RunId): Promise<string | WorkOsError> => {
  const containerIds = await runDockerExpectingSuccess(["ps", "--quiet", "--filter", `label=${RUN_LABEL}=${runId}`]);
  if (containerIds instanceof WorkOsError) return containerIds;

  const [containerId] = containerIds.split("\n").filter((line) => line.length > 0);
  if (containerId === undefined) return new NotFoundError(`The environment for run ${runId} is not running. Send a message to restart it.`);
  return containerId;
};
