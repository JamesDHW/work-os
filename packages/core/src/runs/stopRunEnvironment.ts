import type { Run } from "@work-os/domain/runs/Run";
import { WorkOsError } from "@work-os/shared/WorkOsError";

import type { RunnerGateway } from "../runners/RunnerGateway.ts";
import type { Logger } from "../system/Logger.ts";

type StopRunEnvironmentDependencies = {
  readonly runnerGateway: Pick<RunnerGateway, "request">;
  readonly logger: Logger;
};

export type StopRunEnvironment = (run: Run) => Promise<undefined>;

export const createStopRunEnvironment = (dependencies: StopRunEnvironmentDependencies): StopRunEnvironment => {
  return async (run) => {
    const stopped = await dependencies.runnerGateway.request(run.spec.project.runnerId, { kind: "stopEnvironment", runId: run.id });
    if (stopped instanceof WorkOsError) {
      dependencies.logger.warn("Could not stop a run environment.", { runId: run.id, message: stopped.message });
    }
    return undefined;
  };
};
