import type { ModelProvider, ModelSummary } from "@work-os/domain/models/ModelProvider";
import type { WorkOsError } from "@work-os/shared/WorkOsError";

export type ConfiguredProvider = ModelProvider & {
  readonly apiKey: string | null;
};

/** The live set of providers the agent runtime can call; a seam (pi-ai) implements it. */
export type ModelCatalogue = {
  /** Replaces the configured providers and refreshes their model lists. */
  readonly applyProviders: (providers: readonly ConfiguredProvider[]) => Promise<WorkOsError | undefined>;
  /** Every model whose provider has working credentials, including providers configured from the environment. */
  readonly listAvailableModels: () => Promise<readonly ModelSummary[] | WorkOsError>;
  /** Provider ids that work without being saved, because their credentials come from the environment. */
  readonly listEnvironmentProviders: () => Promise<readonly string[] | WorkOsError>;
};
