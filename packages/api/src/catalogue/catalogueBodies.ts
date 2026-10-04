import type { z } from "@hono/zod-openapi";
import type { AgentPreset } from "@work-os/domain/agents/AgentPreset";
import type { CapabilityDefinition } from "@work-os/domain/capabilities/CapabilityDefinition";
import type { EnvironmentDefinition } from "@work-os/domain/environments/EnvironmentDefinition";
import type { Standard } from "@work-os/domain/standards/Standard";

import type { AgentPresetSchema, CapabilitySchema, EnvironmentSchema, StandardSchema } from "@work-os/protocol/api/catalogue.schema";

import { toOpaqueJson } from "../http/toOpaqueJson.ts";

export type StandardBody = z.output<typeof StandardSchema>;
export type AgentBody = z.output<typeof AgentPresetSchema>;
export type EnvironmentBody = z.output<typeof EnvironmentSchema>;
export type CapabilityBody = z.output<typeof CapabilitySchema>;

export const toStandardBody = (standard: Standard): StandardBody => ({
  ...standard,
  skills: [...standard.skills],
  capabilities: [...standard.capabilities],
  egress: [...standard.egress],
  checks: [...standard.checks],
});

export const toAgentBody = (agent: AgentPreset): AgentBody => ({ ...agent, skills: [...agent.skills] });

export const toEnvironmentBody = (environment: EnvironmentDefinition): EnvironmentBody => ({
  ...environment,
  devcontainer: toOpaqueJson(environment.devcontainer),
  egress: [...environment.egress],
});

export const toCapabilityBody = (capability: CapabilityDefinition): CapabilityBody => ({ ...capability, editableFields: [...capability.editableFields] });
