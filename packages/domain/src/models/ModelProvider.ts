export type ModelProviderKind = "lmStudio" | "anthropic" | "openaiCompatible";

/**
 * Where models come from. The id is the first half of a model reference (`anthropic/claude-sonnet-5-5`,
 * `lmstudio/qwen3-coder`), so LM Studio and Anthropic have fixed ids and only OpenAI-compatible endpoints choose theirs.
 */
export type ModelProvider = {
  readonly id: string;
  readonly kind: ModelProviderKind;
  readonly name: string;
  readonly baseUrl: string | null;
  readonly hasApiKey: boolean;
  readonly createdAt: string;
};

export type ModelSummary = {
  readonly providerId: string;
  readonly modelId: string;
  readonly name: string;
  /** `<provider>/<model>`, the form standards and workspace manifests use. */
  readonly reference: string;
};
