import type { Project } from "@work-os/domain/projects/Project";
import { NotFoundError } from "@work-os/shared/NotFoundError";
import { WorkOsError } from "@work-os/shared/WorkOsError";

import type { StoredConnection } from "./Connection.ts";
import type { ConnectionStore } from "./ConnectionStore.ts";
import type { SecretVault } from "./SecretVault.ts";

type FindConnectionSecretDependencies = {
  readonly connectionStore: Pick<ConnectionStore, "listConnections">;
  readonly secretVault: Pick<SecretVault, "openSecret">;
};

export type FindConnectionSecret = (project: Project, connectionKind: string) => Promise<string | NotFoundError | WorkOsError>;

export const createFindConnectionSecret = (dependencies: FindConnectionSecretDependencies): FindConnectionSecret => {
  return async (project, connectionKind) => {
    const connections = await dependencies.connectionStore.listConnections(project.workspaceId);
    if (connections instanceof WorkOsError) return connections;

    const connection = chooseConnection(connections, project, connectionKind);
    if (connection === undefined) return new NotFoundError(`No ${connectionKind} connection is set up for this workspace.`);

    return dependencies.secretVault.openSecret(connection.sealedSecret);
  };
};

const chooseConnection = (
  connections: readonly StoredConnection[],
  project: Project,
  connectionKind: string,
): StoredConnection | undefined => {
  const matchingKind = connections.filter((connection) => connection.kind === connectionKind);
  const projectConnection = matchingKind.find((connection) => project.connectionIds.includes(connection.id));
  return projectConnection ?? matchingKind[0];
};
