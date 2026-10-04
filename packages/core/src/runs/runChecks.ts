import type { Run } from "@work-os/domain/runs/Run";
import type { Check } from "@work-os/domain/standards/Standard";
import { WorkOsError } from "@work-os/shared/WorkOsError";

import type { RunnerGateway } from "../runners/RunnerGateway.ts";
import { CHECK_OUTPUT_LIMIT, CHECK_TIMEOUT_SECONDS } from "./runs.constants.ts";

export type CheckFailure = {
  readonly name: string;
  readonly exitCode: number;
  readonly output: string;
};

type RunChecksDependencies = {
  readonly runnerGateway: Pick<RunnerGateway, "request">;
};

export type RunChecks = (run: Run) => Promise<readonly CheckFailure[]>;

export const createRunChecks = (dependencies: RunChecksDependencies): RunChecks => {
  return async (run) => {
    const failures: CheckFailure[] = [];
    for (const check of run.spec.standard.checks) {
      const failure = await runCheck(dependencies, run, check);
      if (failure !== undefined) {
        failures.push(failure);
      }
    }
    return failures;
  };
};

const runCheck = async (dependencies: RunChecksDependencies, run: Run, check: Check): Promise<CheckFailure | undefined> => {
  const request = { kind: "exec", runId: run.id, command: check.command, timeoutSeconds: CHECK_TIMEOUT_SECONDS } as const;
  const outcome = await dependencies.runnerGateway.request(run.spec.project.runnerId, request);
  if (outcome instanceof WorkOsError) return { name: check.name, exitCode: -1, output: outcome.message };
  if (outcome.exitCode === 0) return undefined;

  return { name: check.name, exitCode: outcome.exitCode, output: outcome.output.slice(-CHECK_OUTPUT_LIMIT) };
};
