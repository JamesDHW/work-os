import type { ModelProvider, ModelProviderKind } from "@work-os/domain/models/ModelProvider";
import { providerIdFor } from "@work-os/domain/models/providerIdFor";
import { InvalidRequestError } from "@work-os/shared/InvalidRequestError";
import { NotFoundError } from "@work-os/shared/NotFoundError";
import { WorkOsError } from "@work-os/shared/WorkOsError";

import type { SecretVault } from "../connections/SecretVault.ts";
import type { SystemClock } from "../system/SystemClock.ts";
import type { ModelProviderStore, StoredModelProvider } from "./ModelProviderStore.ts";
import type { RefreshModelCatalogue } from "./refreshModelCatalogue.ts";

export type SaveModelProviderInput = {
  readonly requestedId: string;
  readonly kind: ModelProviderKind;
  readonly name: string;
  readonly baseUrl: string | null;
  /** A new key, or undefined to keep the one already stored. */
  readonly apiKey: string | undefined;
};

type SaveModelProviderDependencies = {
  readonly modelProviderStore: Pick<ModelProviderStore, "findModelProvider" | "saveModelProvider">;
  readonly secretVault: Pick<SecretVault, "sealSecret">;
  readonly refreshModelCatalogue: RefreshModelCatalogue;
  readonly clock: SystemClock;
};

export type SaveModelProvider = (input: SaveModelProviderInput) => Promise<ModelProvider | WorkOsError>;

export const createSaveModelProvider = (dependencies: SaveModelProviderDependencies): SaveModelProvider => {
  return async (input) => {
    const id = providerIdFor(input.kind, input.requestedId);
    if (id instanceof WorkOsError) return id;

    const needsUrl = input.kind !== "anthropic" && input.baseUrl === null;
    if (needsUrl) return new InvalidRequestError(`A ${input.kind} provider needs a base URL.`);

    const existing = await dependencies.modelProviderStore.findModelProvider(id);
    const isUnexpectedFailure = existing instanceof WorkOsError && !(existing instanceof NotFoundError);
    if (isUnexpectedFailure) return existing;

    const sealedApiKey = await sealKey(dependencies, input.apiKey, existing instanceof WorkOsError ? null : existing.sealedApiKey);
    if (sealedApiKey instanceof WorkOsError) return sealedApiKey;

    const createdAt = existing instanceof WorkOsError ? dependencies.clock.now() : existing.createdAt;
    const saved = await dependencies.modelProviderStore.saveModelProvider({ id, kind: input.kind, name: input.name, baseUrl: input.baseUrl, hasApiKey: sealedApiKey !== null, sealedApiKey, createdAt });
    if (saved instanceof WorkOsError) return saved;

    const refreshed = await dependencies.refreshModelCatalogue();
    if (refreshed instanceof WorkOsError) return refreshed;
    return toModelProvider(saved);
  };
};

const sealKey = async (dependencies: SaveModelProviderDependencies, apiKey: string | undefined, current: string | null): Promise<string | null | WorkOsError> => {
  if (apiKey === undefined) return current;
  if (apiKey.trim().length === 0) return null;
  return dependencies.secretVault.sealSecret(apiKey.trim());
};

export const toModelProvider = ({ id, kind, name, baseUrl, hasApiKey, createdAt }: StoredModelProvider): ModelProvider => ({ id, kind, name, baseUrl, hasApiKey, createdAt });
