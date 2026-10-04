import type { ConnectionId, EnvironmentId, ProjectId, RunnerId, WorkspaceId } from "../identifiers/Identifiers.ts";

export type ProjectLocation = {
  readonly runnerId: RunnerId;
  readonly path: string;
};

export type Project = {
  readonly id: ProjectId;
  readonly workspaceId: WorkspaceId;
  readonly name: string;
  readonly location: ProjectLocation;
  readonly environmentId: EnvironmentId;
  readonly connectionIds: readonly ConnectionId[];
  readonly createdAt: string;
};
