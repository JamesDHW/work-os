import type { Connection, StoredConnection } from "@work-os/core/connections/Connection";
import type { ConnectionStore } from "@work-os/core/connections/ConnectionStore";
import { toConnectionId, toWorkspaceId, type ConnectionId, type WorkspaceId } from "@work-os/domain/identifiers/Identifiers";
import { NotFoundError } from "@work-os/shared/NotFoundError";
import { tryCatchAsync } from "@work-os/shared/tryCatch";
import { WorkOsError } from "@work-os/shared/WorkOsError";
import { and, asc, eq } from "drizzle-orm";

import { connections } from "../tables/connections.ts";
import type { WorkOsDatabase } from "../WorkOsDatabase.ts";

type ConnectionRow = typeof connections.$inferSelect;

export const createConnectionStore = (database: WorkOsDatabase): ConnectionStore => {
  const createConnection = async (connection: StoredConnection): Promise<Connection | WorkOsError> => {
    const inserted = await tryCatchAsync(() => database.insert(connections).values(connection));
    if (inserted instanceof WorkOsError) return inserted;

    const { sealedSecret, ...visible } = connection;
    return visible;
  };

  const listConnections = async (workspaceId: WorkspaceId): Promise<readonly StoredConnection[] | WorkOsError> => {
    const rows = await tryCatchAsync(() =>
      database.select().from(connections).where(eq(connections.workspaceId, workspaceId)).orderBy(asc(connections.label)),
    );
    if (rows instanceof WorkOsError) return rows;

    return rows.map(toStoredConnection);
  };

  const deleteConnection = async (workspaceId: WorkspaceId, connectionId: ConnectionId): Promise<WorkOsError | undefined> => {
    const condition = and(eq(connections.workspaceId, workspaceId), eq(connections.id, connectionId));
    const deleted = await tryCatchAsync(() => database.delete(connections).where(condition).returning());
    if (deleted instanceof WorkOsError) return deleted;
    if (deleted.length === 0) return new NotFoundError(`Connection ${connectionId} does not exist.`);

    return undefined;
  };

  return { createConnection, listConnections, deleteConnection };
};

const toStoredConnection = (row: ConnectionRow): StoredConnection => ({
  ...row,
  id: toConnectionId(row.id),
  workspaceId: toWorkspaceId(row.workspaceId),
});
