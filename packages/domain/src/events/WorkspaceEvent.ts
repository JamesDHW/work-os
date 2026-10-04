import type { RunId, WorkspaceId } from "../identifiers/Identifiers.ts";

export type WorkspaceEvent =
  | { readonly kind: "runUpdated"; readonly workspaceId: WorkspaceId; readonly runId: RunId }
  | { readonly kind: "inboxUpdated"; readonly workspaceId: WorkspaceId }
  | { readonly kind: "runnersUpdated"; readonly workspaceId: WorkspaceId }
  | { readonly kind: "projectsUpdated"; readonly workspaceId: WorkspaceId }
  | { readonly kind: "catalogueUpdated"; readonly workspaceId: WorkspaceId };

export type WorkspaceEventKind = WorkspaceEvent["kind"];
