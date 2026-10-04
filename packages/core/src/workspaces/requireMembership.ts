import type { UserId, WorkspaceId } from "@work-os/domain/identifiers/Identifiers";
import type { Workspace } from "@work-os/domain/workspaces/Workspace";
import { ForbiddenError } from "@work-os/shared/ForbiddenError";
import { NotFoundError } from "@work-os/shared/NotFoundError";
import type { WorkOsError } from "@work-os/shared/WorkOsError";

import type { WorkspaceStore } from "./WorkspaceStore.ts";

type RequireMembershipDependencies = {
  readonly workspaceStore: Pick<WorkspaceStore, "findMemberWorkspace">;
};

export type RequireMembership = (userId: UserId, workspaceId: WorkspaceId) => Promise<Workspace | WorkOsError>;

export const createRequireMembership = (dependencies: RequireMembershipDependencies): RequireMembership => {
  return async (userId, workspaceId) => {
    const workspace = await dependencies.workspaceStore.findMemberWorkspace(userId, workspaceId);
    if (workspace instanceof NotFoundError) return new ForbiddenError("You are not a member of this workspace.", { cause: workspace });

    return workspace;
  };
};
