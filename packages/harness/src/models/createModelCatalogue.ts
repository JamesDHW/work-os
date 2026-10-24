import { InMemoryCredentialStore, type MutableModels, type Provider } from "@earendil-works/pi-ai";
import { findEnvKeys } from "@earendil-works/pi-ai/compat";
import { builtinModels } from "@earendil-works/pi-ai/providers/all";
import type { ConfiguredProvider, ModelCatalogue } from "@work-os/core/models/ModelCatalogue";
import type { ModelSummary } from "@work-os/domain/models/ModelProvider";
import { tryCatchAsync } from "@work-os/shared/tryCatch";
import { WorkOsError } from "@work-os/shared/WorkOsError";

import { LM_STUDIO_NAME } from "../harness.constants.ts";
import { createChosenProviders } from "./chosenProviders.state.ts";
import { createOpenAiCompatibleProvider } from "./createOpenAiCompatibleProvider.ts";

export type ModelCatalogueOptions = {
  readonly extraProviders: readonly Provider[];
  /** The server's environment, where a provider's API key variable (ANTHROPIC_API_KEY, …) may be set. */
  readonly environment: Readonly<Record<string, string | undefined>>;
};

export type OpenedModelCatalogue = {
  readonly models: MutableModels;
  readonly catalogue: ModelCatalogue;
};

// pi-ai's built-in providers (Anthropic and friends) take their keys from a credential store or the environment;
// endpoints work-os configures are added as providers of their own. Both can change while the server runs.
// Ambient credentials (an AWS profile, say) are deliberately not treated as a configured provider: having them
// does not mean the account can call Bedrock, and a run should never be sent to a provider nobody chose.
export const createModelCatalogue = (options: ModelCatalogueOptions): OpenedModelCatalogue => {
  const credentials = new InMemoryCredentialStore();
  const models = builtinModels({ credentials });
  const builtinIds = new Set(models.getProviders().map((provider) => provider.id));
  const extraIds = new Set(options.extraProviders.map((provider) => provider.id));
  for (const provider of options.extraProviders) {
    models.setProvider(provider);
    builtinIds.add(provider.id);
  }
  const definedEnvironment = Object.fromEntries(Object.entries(options.environment).flatMap(([name, value]) => (value === undefined ? [] : [[name, value]])));
  const hasEnvironmentKey = (id: string): boolean => (findEnvKeys(id, definedEnvironment) ?? []).length > 0;
  const environmentProviderIds = [...builtinIds].filter((id) => extraIds.has(id) || hasEnvironmentKey(id));
  const chosen = createChosenProviders(environmentProviderIds);

  const applyProviders = async (configured: readonly ConfiguredProvider[]): Promise<WorkOsError | undefined> => {
    const configuredIds = new Set(configured.map((provider) => provider.id));
    const isStale = (providerId: string): boolean => !builtinIds.has(providerId) && !configuredIds.has(providerId);
    for (const provider of models.getProviders().filter((candidate) => isStale(candidate.id))) {
      models.deleteProvider(provider.id);
    }
    chosen.replace([...environmentProviderIds, ...configuredIds]);
    for (const provider of configured) {
      await applyProvider(provider);
    }
    const refreshed = await tryCatchAsync(() => models.refresh({ providers: [...configuredIds], allowNetwork: true, force: true }));
    return refreshed instanceof WorkOsError ? refreshed : undefined;
  };

  const applyProvider = async (provider: ConfiguredProvider): Promise<void> => {
    if (builtinIds.has(provider.id)) {
      await credentials.modify(provider.id, async () => (provider.apiKey === null ? undefined : { type: "api_key", key: provider.apiKey }));
      return;
    }
    const baseUrl = provider.baseUrl ?? "";
    const name = provider.kind === "lmStudio" ? LM_STUDIO_NAME : provider.name;
    models.setProvider(createOpenAiCompatibleProvider({ id: provider.id, name, baseUrl, apiKey: provider.apiKey }));
  };

  const listAvailableModels = async (): Promise<readonly ModelSummary[] | WorkOsError> => {
    const available = await tryCatchAsync(() => models.getAvailable());
    if (available instanceof WorkOsError) return available;
    return available
      .filter((model) => chosen.has(model.provider))
      .map((model) => ({ providerId: model.provider, modelId: model.id, name: model.name, reference: `${model.provider}/${model.id}` }));
  };

  const listEnvironmentProviders = async (): Promise<readonly string[] | WorkOsError> => environmentProviderIds.filter((id) => !extraIds.has(id));

  return { models, catalogue: { applyProviders, listAvailableModels, listEnvironmentProviders } };
};
