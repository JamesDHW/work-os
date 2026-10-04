import type { WorkspaceManifest } from "@work-os/protocol/package/workspaceManifest.schema";

export type PackageSource = {
  readonly name: string;
  readonly directory: string;
  readonly isBundled: boolean;
};

export type PackageChain = {
  readonly manifest: WorkspaceManifest;
  readonly sources: readonly PackageSource[];
};
