import { WorkOsError } from "@work-os/shared/WorkOsError";
import { join } from "path";

import type { PackageChain, PackageSource } from "./PackageChain.ts";
import { readPackageManifest } from "./readPackageManifest.ts";

export type PackageLocations = {
  readonly workspaceDirectory: string;
  readonly bundledDirectory: string;
};

export const resolvePackageChain = async (locations: PackageLocations): Promise<PackageChain | WorkOsError> => {
  const manifest = await readPackageManifest(locations.workspaceDirectory);
  if (manifest instanceof WorkOsError) return manifest;

  const bundledSources = manifest.extends.map((name) => bundledSource(locations.bundledDirectory, name));
  const workspaceSource: PackageSource = { name: manifest.name, directory: locations.workspaceDirectory, isBundled: false };
  return { manifest, sources: [...bundledSources, workspaceSource] };
};

const bundledSource = (bundledDirectory: string, name: string): PackageSource => ({
  name,
  directory: join(bundledDirectory, name),
  isBundled: true,
});
