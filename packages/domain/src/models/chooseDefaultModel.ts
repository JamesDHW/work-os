import type { ModelSummary } from "./ModelProvider.ts";
import { PREFERRED_DEFAULT_MODEL_PATTERNS } from "./modelProviders.constants.ts";

/** The model a new workspace starts with: the first available one in order of preference, or the fallback when nothing is configured. */
export const chooseDefaultModel = (available: readonly ModelSummary[], fallback: string): string => {
  const preferred = PREFERRED_DEFAULT_MODEL_PATTERNS.map((pattern) => available.find((model) => pattern.test(model.reference))).find(
    (model): model is ModelSummary => model !== undefined,
  );
  return preferred?.reference ?? available[0]?.reference ?? fallback;
};

/** Whether a model reference names a model the configured providers can serve. */
export const isModelAvailable = (reference: string, available: readonly ModelSummary[]): boolean => available.some((model) => model.reference === reference);
