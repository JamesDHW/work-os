import type { ConnectionId, EnvironmentId, RunnerId, WorkspaceId } from "@work-os/domain/identifiers/Identifiers";
import { toProjectId } from "@work-os/domain/identifiers/Identifiers";
import type { Project } from "@work-os/domain/projects/Project";
import { InvalidRequestError } from "@work-os/shared/InvalidRequestError";
import { WorkOsError } from "@work-os/shared/WorkOsError";

import type { WorkspacePackages } from "../catalogue/WorkspacePackages.ts";
import type { EventBus } from "../events/EventBus.ts";
import type { RunnerStore } from "../runners/RunnerStore.ts";
import type { RandomSource } from "../system/RandomSource.ts";
import type { SystemClock } from "../system/SystemClock.ts";
import type { ProjectStore } from "./ProjectStore.ts";

export type CreateProjectInput = {
  readonly workspaceId: WorkspaceId;
  readonly name: string;
  readonly runnerId: RunnerId;
  readonly path: string;
  readonly environmentId: EnvironmentId;
  readonly connectionIds: readonly ConnectionId[];
};

type CreateProjectDependencies = {
  readonly projectStore: Pick<ProjectStore, "createProject">;
  readonly runnerStore: Pick<RunnerStore, "findRunner">;
  readonly workspacePackages: Pick<WorkspacePackages, "readEnvironment">;
  readonly eventBus: Pick<EventBus, "publish">;
  readonly randomSource: Pick<RandomSource, "createId">;
  readonly clock: SystemClock;
};

export type CreateProject = (input: CreateProjectInput) => Promise<Project | WorkOsError>;

export const createCreateProject = (dependencies: CreateProjectDependencies): CreateProject => {
  return async (input) => {
    const runner = await dependencies.runnerStore.findRunner(input.workspaceId, input.runnerId);
    if (runner instanceof WorkOsError) return new InvalidRequestError("Choose a machine paired with this workspace.", { cause: runner });

    const environment = await dependencies.workspacePackages.readEnvironment(input.workspaceId, input.environmentId);
    if (environment instanceof WorkOsError) return new InvalidRequestError(`Environment "${input.environmentId}" does not exist.`);

    const created = await dependencies.projectStore.createProject({
      id: toProjectId(dependencies.randomSource.createId()),
      workspaceId: input.workspaceId,
      name: input.name,
      location: { runnerId: runner.id, path: input.path },
      environmentId: environment.id,
      connectionIds: input.connectionIds,
      createdAt: dependencies.clock.now(),
    });
    if (created instanceof WorkOsError) return created;

    dependencies.eventBus.publish({ kind: "projectsUpdated", workspaceId: input.workspaceId });
    return created;
  };
};
