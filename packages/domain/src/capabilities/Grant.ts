import type { CapabilityId, GrantId, RunId, StandardId, UserId, WorkspaceId } from "../identifiers/Identifiers.ts";

export type GrantDuration = "once" | "run" | "standard";

export type GrantScope =
  | { readonly kind: "run"; readonly runId: RunId }
  | { readonly kind: "standard"; readonly standardId: StandardId };

export type Grant = {
  readonly id: GrantId;
  readonly workspaceId: WorkspaceId;
  readonly capabilityId: CapabilityId;
  readonly target: string;
  readonly scope: GrantScope;
  readonly createdBy: UserId;
  readonly createdAt: string;
};
