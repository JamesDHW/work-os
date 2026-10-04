import type { RunnerId, WorkspaceId } from "../identifiers/Identifiers.ts";

export type RunnerPlatform = "darwin" | "linux" | "windows";

export type Runner = {
  readonly id: RunnerId;
  readonly workspaceId: WorkspaceId;
  readonly name: string;
  readonly platform: RunnerPlatform;
  readonly pairedAt: string;
  readonly lastSeenAt: string | null;
};
