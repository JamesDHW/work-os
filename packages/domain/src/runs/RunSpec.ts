import type { AgentId, CapabilityId, EnvironmentId, ProjectId, RunId, RunnerId, StandardId } from "../identifiers/Identifiers.ts";
import type { ModelReference } from "../agents/ModelReference.ts";
import type { ThinkingLevel } from "../agents/AgentPreset.ts";
import type { JsonObject } from "../json/Json.ts";
import type { Check, ReviewPolicy } from "../standards/Standard.ts";

export type RunSpec = {
  readonly runId: RunId;
  readonly prompt: string;
  readonly project: {
    readonly id: ProjectId;
    readonly runnerId: RunnerId;
    readonly path: string;
  };
  readonly standard: {
    readonly id: StandardId;
    readonly packageRevision: string;
    readonly criteria: string;
    readonly method: string;
    readonly checks: readonly Check[];
    readonly review: ReviewPolicy;
  };
  readonly agent: {
    readonly id: AgentId;
    readonly model: ModelReference;
    readonly thinkingLevel: ThinkingLevel;
    readonly instructions: string;
  };
  readonly skills: readonly string[];
  readonly capabilities: readonly CapabilityId[];
  readonly environment: {
    readonly id: EnvironmentId;
    readonly devcontainer: JsonObject;
    readonly egress: readonly string[];
  };
};
