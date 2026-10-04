import { createProvider, type Model, type Provider } from "@earendil-works/pi-ai";
import { openAICompletionsApi } from "@earendil-works/pi-ai/api/openai-completions.lazy";
import { OpenAiModelListSchema } from "@work-os/protocol/common/openAiModelList.schema";

import { LM_STUDIO_PROVIDER_ID, LOCAL_MODEL_CONTEXT_WINDOW, LOCAL_MODEL_MAX_TOKENS } from "../harness.constants.ts";

export const createLmStudioProvider = (baseUrl: string): Provider<"openai-completions"> =>
  createProvider<"openai-completions">({
    id: LM_STUDIO_PROVIDER_ID,
    name: "LM Studio",
    baseUrl,
    auth: { apiKey: { name: "LM Studio (no key)", resolve: async () => ({ auth: { apiKey: "lm-studio", baseUrl }, source: "local" }) } },
    models: [],
    fetchModels: async () => {
      const response = await fetch(`${baseUrl}/models`);
      const parsed = OpenAiModelListSchema.safeParse(await response.json());
      return parsed.success ? parsed.data.data.map((entry) => toLocalModel(baseUrl, entry.id)) : [];
    },
    api: openAICompletionsApi(),
  });

const toLocalModel = (baseUrl: string, id: string): Model<"openai-completions"> => ({
  id,
  name: id,
  api: "openai-completions",
  provider: LM_STUDIO_PROVIDER_ID,
  baseUrl,
  input: ["text"],
  cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
  reasoning: false,
  contextWindow: LOCAL_MODEL_CONTEXT_WINDOW,
  maxTokens: LOCAL_MODEL_MAX_TOKENS,
});
