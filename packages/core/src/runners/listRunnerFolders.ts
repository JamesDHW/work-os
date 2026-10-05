import type { RunnerId, WorkspaceId } from "@work-os/domain/identifiers/Identifiers";
import { WorkOsError } from "@work-os/shared/WorkOsError";

import type { RunnerGateway, RunnerResultOf } from "./RunnerGateway.ts";
import type { RunnerStore } from "./RunnerStore.ts";

export type ListRunnerFoldersInput = {
  readonly workspaceId: WorkspaceId;
  readonly runnerId: RunnerId;
  readonly path?: string | undefined;
};

type ListRunnerFoldersDependencies = {
  readonly runnerStore: Pick<RunnerStore, "findRunner">;
  readonly runnerGateway: Pick<RunnerGateway, "request">;
};

export type ListRunnerFolders = (input: ListRunnerFoldersInput) => Promise<RunnerResultOf<"listFolders"> | WorkOsError>;

export const createListRunnerFolders = (dependencies: ListRunnerFoldersDependencies): ListRunnerFolders => {
  return async (input) => {
    const runner = await dependencies.runnerStore.findRunner(input.workspaceId, input.runnerId);
    if (runner instanceof WorkOsError) return runner;

    const request = input.path === undefined ? { kind: "listFolders" as const } : { kind: "listFolders" as const, path: input.path };
    return dependencies.runnerGateway.request(runner.id, request);
  };
};
