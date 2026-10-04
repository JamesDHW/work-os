import type { CapabilityId } from "../identifiers/Identifiers.ts";

export type CapabilityEffect = "read" | "reversible" | "irreversible";
export type CapabilityExecutionSite = "server" | "runnerHost";

export type CapabilityDefinition = {
  readonly id: CapabilityId;
  readonly connectionKind: string;
  readonly description: string;
  readonly effect: CapabilityEffect;
  readonly executionSite: CapabilityExecutionSite;
  readonly editableFields: readonly string[];
};
