import type { WorkspaceId } from "@work-os/domain/identifiers/Identifiers";
import type { Runner } from "@work-os/domain/runners/Runner";
import { WorkOsError } from "@work-os/shared/WorkOsError";

import type { RunnerGateway } from "./RunnerGateway.ts";
import type { RunnerStore } from "./RunnerStore.ts";

export type RunnerPresence = Runner & { readonly isOnline: boolean };

type ListRunnersDependencies = {
  readonly runnerStore: Pick<RunnerStore, "listRunners">;
  readonly runnerGateway: Pick<RunnerGateway, "isOnline">;
};

export type ListRunners = (workspaceId: WorkspaceId) => Promise<readonly RunnerPresence[] | WorkOsError>;

export const createListRunners = (dependencies: ListRunnersDependencies): ListRunners => {
  return async (workspaceId) => {
    const runners = await dependencies.runnerStore.listRunners(workspaceId);
    if (runners instanceof WorkOsError) return runners;

    return runners.map((runner) => ({ ...runner, isOnline: dependencies.runnerGateway.isOnline(runner.id) }));
  };
};
