import { WorkOsError } from "@work-os/shared/WorkOsError";

import type { PackageChain } from "./PackageChain.ts";
import { readPackageManifest } from "./readPackageManifest.ts";

export const readModelAliases = async (chain: PackageChain): Promise<Readonly<Record<string, string>> | WorkOsError> => {
  const bundledSources = chain.sources.filter((source) => source.isBundled);
  const bundledManifests = await Promise.all(bundledSources.map((source) => readPackageManifest(source.directory)));
  const failure = bundledManifests.find((manifest): manifest is WorkOsError => manifest instanceof WorkOsError);
  if (failure !== undefined) return failure;

  const aliasSets = [...bundledManifests.flatMap(modelsOf), chain.manifest.models];
  return Object.fromEntries(aliasSets.flatMap((aliases) => Object.entries(aliases)));
};

const modelsOf = (manifest: Awaited<ReturnType<typeof readPackageManifest>>): readonly Readonly<Record<string, string>>[] => {
  if (manifest instanceof WorkOsError) return [];

  return [manifest.models];
};
