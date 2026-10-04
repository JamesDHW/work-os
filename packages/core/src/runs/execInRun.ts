import type { CommandOutcome } from "@work-os/domain/runners/RunnerResult";
import { WorkOsError } from "@work-os/shared/WorkOsError";

import type { RunnerGateway } from "../runners/RunnerGateway.ts";
import type { RunStore } from "./RunStore.ts";
import type { ExecInRunInput } from "./RunToolHandlers.ts";

type ExecInRunDependencies = {
  readonly runStore: Pick<RunStore, "findRun">;
  readonly runnerGateway: Pick<RunnerGateway, "request">;
};

export type ExecInRun = (input: ExecInRunInput) => Promise<CommandOutcome | WorkOsError>;

export const createExecInRun = (dependencies: ExecInRunDependencies): ExecInRun => {
  return async (input) => {
    const run = await dependencies.runStore.findRun(input.runId);
    if (run instanceof WorkOsError) return run;

    const { onOutput, ...command } = input;
    if (onOutput === undefined) return dependencies.runnerGateway.request(run.spec.project.runnerId, { kind: "exec", ...command });

    return dependencies.runnerGateway.request(run.spec.project.runnerId, { kind: "exec", ...command, streamsOutput: true }, onOutput);
  };
};
