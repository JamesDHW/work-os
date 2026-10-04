import type { CapabilityId, ProjectId, RunId, StandardId, WorkspaceId } from "../identifiers/Identifiers.ts";
import type { Principal } from "../workspaces/Principal.ts";
import type { ChangedFile } from "./ChangedFile.ts";
import type { RunSpec } from "./RunSpec.ts";
import type { RunState } from "./RunState.ts";

export type RunOutputs = {
  readonly changedFiles: readonly ChangedFile[];
  readonly diff: string | null;
};

export type Run = {
  readonly id: RunId;
  readonly workspaceId: WorkspaceId;
  readonly projectId: ProjectId;
  readonly standardId: StandardId;
  readonly principal: Principal;
  readonly spec: RunSpec;
  readonly addedCapabilities: readonly CapabilityId[];
  readonly state: RunState;
  readonly summary: string | null;
  readonly outputs: RunOutputs | null;
  readonly conversationId: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
};
