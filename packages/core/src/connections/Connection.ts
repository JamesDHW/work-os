import type { ConnectionId, WorkspaceId } from "@work-os/domain/identifiers/Identifiers";

export type Connection = {
  readonly id: ConnectionId;
  readonly workspaceId: WorkspaceId;
  readonly kind: string;
  readonly label: string;
  readonly createdAt: string;
};

export type StoredConnection = Connection & {
  readonly sealedSecret: string;
};
