import type { ModelProviderKind } from "./ModelProvider.ts";

export const FIXED_PROVIDER_IDS = { lmStudio: "lmstudio", anthropic: "anthropic" } as const satisfies Partial<Record<ModelProviderKind, string>>;

export const PROVIDER_ID_PATTERN = /^[a-z0-9][a-z0-9-]{0,39}$/u;

export const PREFERRED_DEFAULT_MODEL_PATTERNS: readonly RegExp[] = [/^anthropic\/claude-sonnet/u, /^anthropic\//u, /^lmstudio\//u];
