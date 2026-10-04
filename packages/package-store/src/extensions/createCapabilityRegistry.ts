import type { CapabilityImplementation, CapabilityRegistry } from "@work-os/core/capabilities/CapabilityRegistry";
import type { CapabilityId, WorkspaceId } from "@work-os/domain/identifiers/Identifiers";
import type { ExtensionCapability } from "@work-os/sdk/defineCapability";
import type { Extension } from "@work-os/sdk/defineExtension";
import { NotFoundError } from "@work-os/shared/NotFoundError";
import { WorkOsError } from "@work-os/shared/WorkOsError";
import { join } from "path";

import { resolvePackageChain } from "../manifest/resolvePackageChain.ts";
import { adaptCapability } from "./adaptCapability.ts";
import { createHttpClient } from "./createHttpClient.ts";
import { createWorkspaceFiles } from "./createWorkspaceFiles.ts";
import { loadExtension } from "./loadExtension.ts";

export type CapabilityRegistryOptions = {
  readonly workspacesDirectory: string;
  readonly bundledDirectory: string;
  readonly onPackageChanged: (workspaceId: WorkspaceId) => void;
};

export const createCapabilityRegistry = (options: CapabilityRegistryOptions): CapabilityRegistry => {
  const http = createHttpClient();

  const listExtensionCapabilities = async (workspaceId: WorkspaceId): Promise<readonly ExtensionCapability[] | WorkOsError> => {
    const workspaceDirectory = join(options.workspacesDirectory, workspaceId);
    const chain = await resolvePackageChain({ workspaceDirectory, bundledDirectory: options.bundledDirectory });
    if (chain instanceof WorkOsError) return chain;

    const extensions = await Promise.all(chain.sources.map(loadExtension));
    const failure = extensions.find((extension): extension is WorkOsError => extension instanceof WorkOsError);
    if (failure !== undefined) return failure;

    return extensions.flatMap(capabilitiesOf);
  };

  const implementationFor = (workspaceId: WorkspaceId, capability: ExtensionCapability): CapabilityImplementation => {
    const workspaceFiles = createWorkspaceFiles(join(options.workspacesDirectory, workspaceId), () => options.onPackageChanged(workspaceId));
    return adaptCapability(capability, { http, workspaceFiles });
  };

  return {
    listCapabilities: async (workspaceId) => {
      const capabilities = await listExtensionCapabilities(workspaceId);
      if (capabilities instanceof WorkOsError) return capabilities;
      return capabilities.map((capability) => implementationFor(workspaceId, capability).definition);
    },
    findCapability: async (workspaceId: WorkspaceId, capabilityId: CapabilityId) => {
      const capabilities = await listExtensionCapabilities(workspaceId);
      if (capabilities instanceof WorkOsError) return capabilities;

      const capability = capabilities.find((candidate) => candidate.id === capabilityId);
      if (capability === undefined) return new NotFoundError(`Capability ${capabilityId} is not provided by any package.`);
      return implementationFor(workspaceId, capability);
    },
  };
};

const capabilitiesOf = (extension: Extension | null | WorkOsError): readonly ExtensionCapability[] => {
  const isMissing = extension === null || extension instanceof WorkOsError;
  if (isMissing) return [];

  return extension.capabilities;
};
