import { ConflictError } from "@work-os/shared/ConflictError";
import { WorkOsError } from "@work-os/shared/WorkOsError";

import type { FinishCheckedRun } from "./finishCheckedRun.ts";
import type { HandleCheckFailures } from "./handleCheckFailures.ts";
import type { RunChecks } from "./runChecks.ts";
import type { RunStore } from "./RunStore.ts";
import type { CompleteRunInput, CompletionResult } from "./RunToolHandlers.ts";
import type { TransitionRun } from "./transitionRun.ts";

type CompleteRunDependencies = {
  readonly runStore: Pick<RunStore, "findRun">;
  readonly transitionRun: TransitionRun;
  readonly runChecks: RunChecks;
  readonly handleCheckFailures: HandleCheckFailures;
  readonly finishCheckedRun: FinishCheckedRun;
};

export type CompleteRun = (input: CompleteRunInput) => Promise<CompletionResult | WorkOsError>;

export const createCompleteRun = (dependencies: CompleteRunDependencies): CompleteRun => {
  return async (input) => {
    const run = await dependencies.runStore.findRun(input.runId);
    if (run instanceof WorkOsError) return run;
    if (run.state.status !== "running") return new ConflictError(`complete is only available while the run is working, not ${run.state.status}.`);

    const checking = await dependencies.transitionRun({ run, event: { kind: "completionRequested" }, change: { summary: input.summary } });
    if (checking instanceof WorkOsError) return checking;

    const failures = await dependencies.runChecks(checking);
    if (failures.length > 0) return dependencies.handleCheckFailures(checking, failures);

    return dependencies.finishCheckedRun(checking);
  };
};
