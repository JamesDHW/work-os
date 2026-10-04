import type { AgentId } from "../identifiers/Identifiers.ts";

export type ThinkingLevel = "off" | "minimal" | "low" | "medium" | "high";

export type AgentPreset = {
  readonly id: AgentId;
  readonly name: string;
  readonly model: string;
  readonly thinkingLevel: ThinkingLevel;
  readonly skills: readonly string[];
  readonly instructions: string;
};
