import { z } from "zod";

export const ModelProviderKindSchema = z.enum(["lmStudio", "anthropic", "openaiCompatible"]).meta({ id: "ModelProviderKind" });

export const ModelProviderSchema = z
  .object({
    id: z.string(),
    kind: ModelProviderKindSchema,
    name: z.string(),
    baseUrl: z.string().nullable(),
    hasApiKey: z.boolean(),
    createdAt: z.string(),
    source: z.enum(["settings", "environment"]),
  })
  .meta({ id: "ModelProvider" });

export const SaveModelProviderRequestSchema = z
  .object({
    kind: ModelProviderKindSchema,
    name: z.string().min(1).max(80),
    baseUrl: z.url().nullable(),
    /** A new key; omit to keep the saved one, send an empty string to remove it. */
    apiKey: z.string().max(4000).optional(),
  })
  .meta({ id: "SaveModelProviderRequest" });

export const ModelProviderParamsSchema = z.object({ providerId: z.string().min(1).max(40) });

export const ModelSummarySchema = z
  .object({ providerId: z.string(), modelId: z.string(), name: z.string(), reference: z.string() })
  .meta({ id: "ModelSummary" });

export const AvailableModelsResponseSchema = z.object({ models: z.array(ModelSummarySchema) }).meta({ id: "AvailableModelsResponse" });

export const DefaultModelSchema = z.object({ model: z.string().min(3).max(200) }).meta({ id: "DefaultModel" });
