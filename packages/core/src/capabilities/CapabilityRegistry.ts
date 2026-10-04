import type { CapabilityDefinition } from "@work-os/domain/capabilities/CapabilityDefinition";
import type { CapabilityId, WorkspaceId } from "@work-os/domain/identifiers/Identifiers";
import type { JsonObject } from "@work-os/domain/json/Json";
import type { HostCredential } from "@work-os/domain/runners/RunnerRequest";
import type { CommandOutcome } from "@work-os/domain/runners/RunnerResult";
import type { NotFoundError } from "@work-os/shared/NotFoundError";
import type { WorkOsError } from "@work-os/shared/WorkOsError";

export type HostCommand = {
  readonly program: "git";
  readonly arguments: readonly string[];
  readonly credential?: HostCredential;
};

export type CapabilityExecution = {
  readonly arguments: JsonObject;
  readonly target: string;
  readonly secret: string | null;
  readonly runHostCommand: (command: HostCommand) => Promise<CommandOutcome | WorkOsError>;
};

export type CapabilityImplementation = {
  readonly definition: CapabilityDefinition;
  readonly execute: (execution: CapabilityExecution) => Promise<string | WorkOsError>;
};

export type CapabilityRegistry = {
  readonly listCapabilities: (workspaceId: WorkspaceId) => Promise<readonly CapabilityDefinition[] | WorkOsError>;
  readonly findCapability: (
    workspaceId: WorkspaceId,
    capabilityId: CapabilityId,
  ) => Promise<CapabilityImplementation | NotFoundError | WorkOsError>;
};
