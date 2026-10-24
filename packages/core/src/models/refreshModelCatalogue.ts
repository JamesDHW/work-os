import { WorkOsError } from "@work-os/shared/WorkOsError";

import type { SecretVault } from "../connections/SecretVault.ts";
import type { ConfiguredProvider, ModelCatalogue } from "./ModelCatalogue.ts";
import type { ModelProviderStore, StoredModelProvider } from "./ModelProviderStore.ts";

type RefreshModelCatalogueDependencies = {
  readonly modelProviderStore: Pick<ModelProviderStore, "listModelProviders">;
  readonly secretVault: Pick<SecretVault, "openSecret">;
  readonly modelCatalogue: Pick<ModelCatalogue, "applyProviders">;
};

export type RefreshModelCatalogue = () => Promise<WorkOsError | undefined>;

// Keys leave the vault only here, straight into the model runtime; nothing else reads them back.
export const createRefreshModelCatalogue = (dependencies: RefreshModelCatalogueDependencies): RefreshModelCatalogue => {
  return async () => {
    const stored = await dependencies.modelProviderStore.listModelProviders();
    if (stored instanceof WorkOsError) return stored;

    const configured = await Promise.all(stored.map((provider) => openProvider(dependencies, provider)));
    const failure = configured.find((provider): provider is WorkOsError => provider instanceof WorkOsError);
    if (failure !== undefined) return failure;

    return dependencies.modelCatalogue.applyProviders(configured.filter((provider): provider is ConfiguredProvider => !(provider instanceof WorkOsError)));
  };
};

const openProvider = async (dependencies: RefreshModelCatalogueDependencies, provider: StoredModelProvider): Promise<ConfiguredProvider | WorkOsError> => {
  const { sealedApiKey, ...summary } = provider;
  if (sealedApiKey === null) return { ...summary, apiKey: null };

  const apiKey = await dependencies.secretVault.openSecret(sealedApiKey);
  if (apiKey instanceof WorkOsError) return apiKey;
  return { ...summary, apiKey };
};
