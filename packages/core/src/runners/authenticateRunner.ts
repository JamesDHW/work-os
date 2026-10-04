import type { Runner } from "@work-os/domain/runners/Runner";
import { NotFoundError } from "@work-os/shared/NotFoundError";
import { UnauthenticatedError } from "@work-os/shared/UnauthenticatedError";
import type { WorkOsError } from "@work-os/shared/WorkOsError";

import type { RandomSource } from "../system/RandomSource.ts";
import type { RunnerStore } from "./RunnerStore.ts";

type AuthenticateRunnerDependencies = {
  readonly runnerStore: Pick<RunnerStore, "findRunnerByTokenHash">;
  readonly randomSource: Pick<RandomSource, "hashToken">;
};

export type AuthenticateRunner = (token: string) => Promise<Runner | WorkOsError>;

export const createAuthenticateRunner = (dependencies: AuthenticateRunnerDependencies): AuthenticateRunner => {
  return async (token) => {
    const runner = await dependencies.runnerStore.findRunnerByTokenHash(dependencies.randomSource.hashToken(token));
    if (runner instanceof NotFoundError) return new UnauthenticatedError("This machine is not paired. Pair it again.");

    return runner;
  };
};
