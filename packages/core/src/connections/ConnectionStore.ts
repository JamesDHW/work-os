import type { ConnectionId, WorkspaceId } from "@work-os/domain/identifiers/Identifiers";
import type { NotFoundError } from "@work-os/shared/NotFoundError";
import type { WorkOsError } from "@work-os/shared/WorkOsError";

import type { Connection, StoredConnection } from "./Connection.ts";

export type ConnectionStore = {
  readonly createConnection: (connection: StoredConnection) => Promise<Connection | WorkOsError>;
  readonly listConnections: (workspaceId: WorkspaceId) => Promise<readonly StoredConnection[] | WorkOsError>;
  readonly deleteConnection: (workspaceId: WorkspaceId, connectionId: ConnectionId) => Promise<NotFoundError | WorkOsError | undefined>;
};
