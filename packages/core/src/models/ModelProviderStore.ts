import type { ModelProvider } from "@work-os/domain/models/ModelProvider";
import type { NotFoundError } from "@work-os/shared/NotFoundError";
import type { WorkOsError } from "@work-os/shared/WorkOsError";

export type StoredModelProvider = ModelProvider & {
  readonly sealedApiKey: string | null;
};

export type ModelProviderStore = {
  readonly listModelProviders: () => Promise<readonly StoredModelProvider[] | WorkOsError>;
  readonly findModelProvider: (providerId: string) => Promise<StoredModelProvider | NotFoundError | WorkOsError>;
  readonly saveModelProvider: (provider: StoredModelProvider) => Promise<StoredModelProvider | WorkOsError>;
  readonly deleteModelProvider: (providerId: string) => Promise<WorkOsError | undefined>;
};
