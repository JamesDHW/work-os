import type { ModelProviderKind } from "../../api/apiTypes.ts";

export const PROVIDER_KINDS: readonly ModelProviderKind[] = ["lmStudio", "anthropic", "openaiCompatible"];

export const PROVIDER_KIND_LABELS = {
  lmStudio: "LM Studio (local)",
  anthropic: "Anthropic",
  openaiCompatible: "OpenAI-compatible endpoint",
} as const satisfies Readonly<Record<ModelProviderKind, string>>;

export const PROVIDER_URL_PLACEHOLDERS = {
  lmStudio: "http://localhost:1234/v1",
  anthropic: "",
  openaiCompatible: "https://gateway.example.com/v1",
} as const satisfies Readonly<Record<ModelProviderKind, string>>;

export const FIXED_PROVIDER_IDS = { lmStudio: "lmstudio", anthropic: "anthropic" } as const;
