import { toWorkspaceId } from "@work-os/domain/identifiers/Identifiers";
import type { User } from "@work-os/domain/workspaces/User";
import type { Workspace } from "@work-os/domain/workspaces/Workspace";
import { WorkOsError } from "@work-os/shared/WorkOsError";

import type { WorkspacePackages } from "../catalogue/WorkspacePackages.ts";
import type { RandomSource } from "../system/RandomSource.ts";
import type { SystemClock } from "../system/SystemClock.ts";
import type { WorkspaceStore } from "./WorkspaceStore.ts";

type CreatePersonalWorkspaceDependencies = {
  readonly workspaceStore: Pick<WorkspaceStore, "createWorkspace">;
  readonly workspacePackages: Pick<WorkspacePackages, "ensurePackage">;
  readonly randomSource: Pick<RandomSource, "createId">;
  readonly clock: SystemClock;
};

export type CreatePersonalWorkspace = (owner: User) => Promise<Workspace | WorkOsError>;

export const createCreatePersonalWorkspace = (dependencies: CreatePersonalWorkspaceDependencies): CreatePersonalWorkspace => {
  return async (owner) => {
    const workspace: Workspace = {
      id: toWorkspaceId(dependencies.randomSource.createId()),
      name: `${owner.displayName}'s workspace`,
      kind: "personal",
      createdAt: dependencies.clock.now(),
    };
    const created = await dependencies.workspaceStore.createWorkspace(workspace, owner.id);
    if (created instanceof WorkOsError) return created;

    const revision = await dependencies.workspacePackages.ensurePackage(created);
    if (revision instanceof WorkOsError) return revision;

    return created;
  };
};
