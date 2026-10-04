import { z } from "zod";

import type { AgentPreset } from "@work-os/domain/agents/AgentPreset";
import type { CapabilityDefinition } from "@work-os/domain/capabilities/CapabilityDefinition";
import type { Standard } from "@work-os/domain/standards/Standard";

import {
  AgentIdSchema,
  CapabilityIdSchema,
  EnvironmentIdSchema,
  StandardIdSchema,
} from "../common/identifiers.schema.ts";
import { OpaqueJsonObjectSchema } from "../common/json.schema.ts";
import { ThinkingLevelSchema } from "../package/agentFrontmatter.schema.ts";
import { CheckSchema, ReviewPolicySchema } from "../package/standardFrontmatter.schema.ts";

export const StandardSchema = z
  .object({
    id: StandardIdSchema,
    describes: z.string(),
    consumer: z.string(),
    agentId: AgentIdSchema,
    skills: z.array(z.string()),
    capabilities: z.array(CapabilityIdSchema),
    egress: z.array(z.string()),
    checks: z.array(CheckSchema),
    review: ReviewPolicySchema,
    inputHint: z.string().exactOptional(),
    criteria: z.string(),
    method: z.string(),
  })
  .meta({ id: "Standard" }) satisfies z.ZodType<Standard>;

export const SaveStandardRequestSchema = StandardSchema.meta({ id: "SaveStandardRequest" });

export const AgentPresetSchema = z
  .object({
    id: AgentIdSchema,
    name: z.string(),
    model: z.string(),
    thinkingLevel: ThinkingLevelSchema,
    skills: z.array(z.string()),
    instructions: z.string(),
  })
  .meta({ id: "AgentPreset" }) satisfies z.ZodType<AgentPreset>;

export const EnvironmentSchema = z
  .object({ id: EnvironmentIdSchema, devcontainer: OpaqueJsonObjectSchema, egress: z.array(z.string()) })
  .meta({ id: "Environment" });

export const CapabilitySchema = z
  .object({
    id: CapabilityIdSchema,
    connectionKind: z.string(),
    description: z.string(),
    effect: z.enum(["read", "reversible", "irreversible"]),
    executionSite: z.enum(["server", "runnerHost"]),
    editableFields: z.array(z.string()),
  })
  .meta({ id: "Capability" }) satisfies z.ZodType<CapabilityDefinition>;

export const StandardParamsSchema = z.object({ standardId: StandardIdSchema });
