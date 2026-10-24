import type { ModelProviderStore, StoredModelProvider } from "@work-os/core/models/ModelProviderStore";
import type { ModelProviderKind } from "@work-os/domain/models/ModelProvider";
import { InvalidRequestError } from "@work-os/shared/InvalidRequestError";
import { NotFoundError } from "@work-os/shared/NotFoundError";
import { tryCatchAsync } from "@work-os/shared/tryCatch";
import { WorkOsError } from "@work-os/shared/WorkOsError";
import { asc, eq } from "drizzle-orm";

import { modelProviders } from "../tables/modelProviders.ts";
import type { WorkOsDatabase } from "../WorkOsDatabase.ts";

type Row = typeof modelProviders.$inferSelect;

const KINDS: readonly ModelProviderKind[] = ["lmStudio", "anthropic", "openaiCompatible"];

export const createModelProviderStore = (database: WorkOsDatabase): ModelProviderStore => {
  const listModelProviders = async (): Promise<readonly StoredModelProvider[] | WorkOsError> => {
    const rows = await tryCatchAsync(() => database.select().from(modelProviders).orderBy(asc(modelProviders.createdAt)));
    if (rows instanceof WorkOsError) return rows;

    const providers = rows.map(toStoredProvider);
    const failure = providers.find((provider): provider is WorkOsError => provider instanceof WorkOsError);
    return failure ?? providers.filter((provider): provider is StoredModelProvider => !(provider instanceof WorkOsError));
  };

  const findModelProvider = async (providerId: string): Promise<StoredModelProvider | WorkOsError> => {
    const rows = await tryCatchAsync(() => database.select().from(modelProviders).where(eq(modelProviders.id, providerId)));
    if (rows instanceof WorkOsError) return rows;

    const row = rows[0];
    if (row === undefined) return new NotFoundError(`Model provider ${providerId} does not exist.`);
    return toStoredProvider(row);
  };

  const saveModelProvider = async (provider: StoredModelProvider): Promise<StoredModelProvider | WorkOsError> => {
    const values = { id: provider.id, kind: provider.kind, name: provider.name, baseUrl: provider.baseUrl, sealedApiKey: provider.sealedApiKey, createdAt: provider.createdAt };
    const saved = await tryCatchAsync(() => database.insert(modelProviders).values(values).onConflictDoUpdate({ target: modelProviders.id, set: values }));
    if (saved instanceof WorkOsError) return saved;
    return provider;
  };

  const deleteModelProvider = async (providerId: string): Promise<WorkOsError | undefined> => {
    const deleted = await tryCatchAsync(() => database.delete(modelProviders).where(eq(modelProviders.id, providerId)));
    return deleted instanceof WorkOsError ? deleted : undefined;
  };

  return { listModelProviders, findModelProvider, saveModelProvider, deleteModelProvider };
};

const toStoredProvider = (row: Row): StoredModelProvider | WorkOsError => {
  const kind = KINDS.find((candidate) => candidate === row.kind);
  if (kind === undefined) return new InvalidRequestError(`Model provider ${row.id} has an unknown kind "${row.kind}".`);
  return { id: row.id, kind, name: row.name, baseUrl: row.baseUrl, sealedApiKey: row.sealedApiKey, hasApiKey: row.sealedApiKey !== null, createdAt: row.createdAt };
};
