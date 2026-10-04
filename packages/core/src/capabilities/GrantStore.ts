import type { Grant } from "@work-os/domain/capabilities/Grant";
import type { GrantId, WorkspaceId } from "@work-os/domain/identifiers/Identifiers";
import type { NotFoundError } from "@work-os/shared/NotFoundError";
import type { WorkOsError } from "@work-os/shared/WorkOsError";

export type GrantStore = {
  readonly createGrant: (grant: Grant) => Promise<Grant | WorkOsError>;
  readonly listGrants: (workspaceId: WorkspaceId) => Promise<readonly Grant[] | WorkOsError>;
  readonly revokeGrant: (workspaceId: WorkspaceId, grantId: GrantId) => Promise<NotFoundError | WorkOsError | undefined>;
};
