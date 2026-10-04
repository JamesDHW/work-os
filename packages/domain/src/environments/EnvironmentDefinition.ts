import type { EnvironmentId } from "../identifiers/Identifiers.ts";
import type { JsonObject } from "../json/Json.ts";

export type EnvironmentDefinition = {
  readonly id: EnvironmentId;
  readonly devcontainer: JsonObject;
  readonly egress: readonly string[];
};
