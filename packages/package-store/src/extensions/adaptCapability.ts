import type { CapabilityImplementation } from "@work-os/core/capabilities/CapabilityRegistry";
import { toCapabilityId } from "@work-os/domain/identifiers/Identifiers";
import { CapabilityError } from "@work-os/sdk/CapabilityError";
import type { ExtensionCapability } from "@work-os/sdk/defineCapability";
import type { HostServices } from "@work-os/sdk/HostServices";
import { WorkOsError } from "@work-os/shared/WorkOsError";

export const adaptCapability = (
  capability: ExtensionCapability,
  services: Omit<HostServices, "runGit">,
): CapabilityImplementation => ({
  definition: {
    id: toCapabilityId(capability.id),
    connectionKind: capability.connectionKind,
    description: capability.description,
    effect: capability.effect,
    executionSite: capability.executionSite,
    editableFields: capability.editableFields,
  },
  execute: async (execution) => {
    return capability.execute({
      ...services,
      arguments: execution.arguments,
      target: execution.target,
      secret: execution.secret,
      runGit: async (command) => {
        const outcome = await execution.runHostCommand({ program: "git", ...command });
        if (outcome instanceof WorkOsError) return new CapabilityError(outcome.message, { cause: outcome });
        return outcome;
      },
    });
  },
});
