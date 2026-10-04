import type { UserId, WorkspaceId } from "@work-os/domain/identifiers/Identifiers";
import type { Workspace } from "@work-os/domain/workspaces/Workspace";
import type { NotFoundError } from "@work-os/shared/NotFoundError";
import type { WorkOsError } from "@work-os/shared/WorkOsError";

export type WorkspaceStore = {
  readonly createWorkspace: (workspace: Workspace, ownerId: UserId) => Promise<Workspace | WorkOsError>;
  readonly listWorkspacesForUser: (userId: UserId) => Promise<readonly Workspace[] | WorkOsError>;
  readonly findMemberWorkspace: (userId: UserId, workspaceId: WorkspaceId) => Promise<Workspace | NotFoundError | WorkOsError>;
  readonly listMemberIds: (workspaceId: WorkspaceId) => Promise<readonly UserId[] | WorkOsError>;
};
