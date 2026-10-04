import type { CapabilityId, RunId, StandardId } from "../identifiers/Identifiers.ts";
import type { JsonObject } from "../json/Json.ts";

export type CapabilityCall = {
  readonly runId: RunId;
  readonly standardId: StandardId;
  readonly capabilityId: CapabilityId;
  readonly target: string;
  readonly arguments: JsonObject;
};
