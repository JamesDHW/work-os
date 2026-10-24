import type { WorkOsError } from "@work-os/shared/WorkOsError";

import type { ModelProviderStore } from "./ModelProviderStore.ts";
import type { RefreshModelCatalogue } from "./refreshModelCatalogue.ts";

type DeleteModelProviderDependencies = {
  readonly modelProviderStore: Pick<ModelProviderStore, "deleteModelProvider">;
  readonly refreshModelCatalogue: RefreshModelCatalogue;
};

export type DeleteModelProvider = (providerId: string) => Promise<WorkOsError | undefined>;

export const createDeleteModelProvider = (dependencies: DeleteModelProviderDependencies): DeleteModelProvider => {
  return async (providerId) => {
    const deleted = await dependencies.modelProviderStore.deleteModelProvider(providerId);
    if (deleted !== undefined) return deleted;
    return dependencies.refreshModelCatalogue();
  };
};
