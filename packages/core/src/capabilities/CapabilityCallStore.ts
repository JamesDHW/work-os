import type { CapabilityId, RunId, WorkspaceId } from "@work-os/domain/identifiers/Identifiers";
import type { JsonObject } from "@work-os/domain/json/Json";
import type { WorkOsError } from "@work-os/shared/WorkOsError";

export type CapabilityCallStatus = "pending" | "succeeded" | "failed" | "refused";

export type CapabilityCallRecord = {
  readonly id: string;
  readonly workspaceId: WorkspaceId;
  readonly runId: RunId;
  readonly capabilityId: CapabilityId;
  readonly target: string;
  readonly arguments: JsonObject;
  readonly status: CapabilityCallStatus;
  readonly result: string | null;
  readonly createdAt: string;
};

export type CapabilityCallStore = {
  readonly saveCapabilityCall: (record: CapabilityCallRecord) => Promise<CapabilityCallRecord | WorkOsError>;
  readonly findCapabilityCall: (id: string) => Promise<CapabilityCallRecord | null | WorkOsError>;
  readonly listCapabilityCalls: (runId: RunId) => Promise<readonly CapabilityCallRecord[] | WorkOsError>;
};
