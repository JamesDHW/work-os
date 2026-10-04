import type { WorkspaceId } from "../identifiers/Identifiers.ts";

export type WorkspaceKind = "personal" | "organisation";

export type Workspace = {
  readonly id: WorkspaceId;
  readonly name: string;
  readonly kind: WorkspaceKind;
  readonly createdAt: string;
};
