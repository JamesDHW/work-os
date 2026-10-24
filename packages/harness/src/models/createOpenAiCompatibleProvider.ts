import { createProvider, type Model, type Provider } from "@earendil-works/pi-ai";
import { openAICompletionsApi } from "@earendil-works/pi-ai/api/openai-completions.lazy";
import { OpenAiModelListSchema } from "@work-os/protocol/common/openAiModelList.schema";

import { LOCAL_MODEL_CONTEXT_WINDOW, LOCAL_MODEL_MAX_TOKENS } from "../harness.constants.ts";

export type OpenAiCompatibleEndpoint = {
  readonly id: string;
  readonly name: string;
  readonly baseUrl: string;
  /** null for a local server that needs no key; the key is then a placeholder the server ignores. */
  readonly apiKey: string | null;
};

// LM Studio, LiteLLM, Bedrock gateways and the like all speak the OpenAI completions API and list their models at /models.
export const createOpenAiCompatibleProvider = (endpoint: OpenAiCompatibleEndpoint): Provider<"openai-completions"> =>
  createProvider<"openai-completions">({
    id: endpoint.id,
    name: endpoint.name,
    baseUrl: endpoint.baseUrl,
    auth: {
      apiKey: {
        name: `${endpoint.name} API key`,
        resolve: async () => ({ auth: { apiKey: endpoint.apiKey ?? "no-key", baseUrl: endpoint.baseUrl }, source: endpoint.apiKey === null ? "no key needed" : "work-os settings" }),
      },
    },
    models: [],
    fetchModels: async () => {
      const headers = endpoint.apiKey === null ? {} : { authorization: `Bearer ${endpoint.apiKey}` };
      const response = await fetch(`${endpoint.baseUrl}/models`, { headers });
      const parsed = OpenAiModelListSchema.safeParse(await response.json());
      return parsed.success ? parsed.data.data.map((entry) => toEndpointModel(endpoint, entry.id)) : [];
    },
    api: openAICompletionsApi(),
  });

const toEndpointModel = (endpoint: OpenAiCompatibleEndpoint, id: string): Model<"openai-completions"> => ({
  id,
  name: id,
  api: "openai-completions",
  provider: endpoint.id,
  baseUrl: endpoint.baseUrl,
  input: ["text"],
  cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
  reasoning: false,
  contextWindow: LOCAL_MODEL_CONTEXT_WINDOW,
  maxTokens: LOCAL_MODEL_MAX_TOKENS,
});
