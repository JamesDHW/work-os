import type { ObservationId, RunId, WorkspaceId } from "../identifiers/Identifiers.ts";
import type { JsonObject } from "../json/Json.ts";

export type ObservationKind =
  | "questionAsked"
  | "capabilityRefused"
  | "capabilityAddedDuringRun"
  | "humanCorrection"
  | "checkFailed"
  | "reviewRejected"
  | "revisionRequested"
  | "egressBlocked";

export type Observation = {
  readonly id: ObservationId;
  readonly workspaceId: WorkspaceId;
  readonly runId: RunId;
  readonly kind: ObservationKind;
  readonly detail: JsonObject;
  readonly createdAt: string;
};
