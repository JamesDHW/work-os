import type { AgentId, CapabilityId, StandardId } from "../identifiers/Identifiers.ts";

export type ReviewPolicy = "required" | "optional" | "none";

export type Check = {
  readonly name: string;
  readonly command: string;
};

export type Standard = {
  readonly id: StandardId;
  readonly describes: string;
  readonly consumer: string;
  readonly agentId: AgentId;
  readonly skills: readonly string[];
  readonly capabilities: readonly CapabilityId[];
  readonly egress: readonly string[];
  readonly checks: readonly Check[];
  readonly review: ReviewPolicy;
  readonly inputHint?: string | undefined;
  readonly criteria: string;
  readonly method: string;
};
