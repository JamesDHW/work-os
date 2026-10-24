import type { ModelProvider } from "@work-os/domain/models/ModelProvider";
import { FIXED_PROVIDER_IDS } from "@work-os/domain/models/modelProviders.constants";
import { WorkOsError } from "@work-os/shared/WorkOsError";

import type { ModelCatalogue } from "./ModelCatalogue.ts";
import type { ModelProviderStore } from "./ModelProviderStore.ts";
import { toModelProvider } from "./saveModelProvider.ts";

export type ModelProviderView = ModelProvider & {
  /** Where the credentials come from: saved in work-os, or an environment variable the server was started with. */
  readonly source: "settings" | "environment";
};

type ListModelProvidersDependencies = {
  readonly modelProviderStore: Pick<ModelProviderStore, "listModelProviders">;
  readonly modelCatalogue: Pick<ModelCatalogue, "listEnvironmentProviders">;
};

export type ListModelProviders = () => Promise<readonly ModelProviderView[] | WorkOsError>;

export const createListModelProviders = (dependencies: ListModelProvidersDependencies): ListModelProviders => {
  return async () => {
    const stored = await dependencies.modelProviderStore.listModelProviders();
    if (stored instanceof WorkOsError) return stored;

    const fromEnvironment = await dependencies.modelCatalogue.listEnvironmentProviders();
    if (fromEnvironment instanceof WorkOsError) return fromEnvironment;

    const saved = stored.map((provider) => ({ ...toModelProvider(provider), source: "settings" as const }));
    const savedIds = new Set(saved.map((provider) => provider.id));
    const environmentOnly = fromEnvironment.filter((id) => !savedIds.has(id)).map(environmentProvider);
    return [...saved, ...environmentOnly];
  };
};

const environmentProvider = (id: string): ModelProviderView => ({
  id,
  kind: id === FIXED_PROVIDER_IDS.anthropic ? "anthropic" : "openaiCompatible",
  name: id,
  baseUrl: null,
  hasApiKey: true,
  createdAt: "",
  source: "environment",
});
