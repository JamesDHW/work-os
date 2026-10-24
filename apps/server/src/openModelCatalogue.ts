import type { ServerConfig } from "@work-os/config/ServerConfig";
import type { SecretVault } from "@work-os/core/connections/SecretVault";
import type { ModelProviderStore } from "@work-os/core/models/ModelProviderStore";
import { createRefreshModelCatalogue, type RefreshModelCatalogue } from "@work-os/core/models/refreshModelCatalogue";
import type { SystemClock } from "@work-os/core/system/SystemClock";
import { FIXED_PROVIDER_IDS } from "@work-os/domain/models/modelProviders.constants";
import { createModelCatalogue, type OpenedModelCatalogue } from "@work-os/harness/models/createModelCatalogue";
import { createScriptedProvider } from "@work-os/harness/models/createScriptedProvider";
import { ScriptedResponsesSchema } from "@work-os/protocol/common/scriptedResponses.schema";
import { parseWithSchema } from "@work-os/protocol/common/parseWithSchema";
import { NotFoundError } from "@work-os/shared/NotFoundError";
import { tryCatch } from "@work-os/shared/tryCatch";
import { WorkOsError } from "@work-os/shared/WorkOsError";
import process from "process";

import { LM_STUDIO_SEED_NAME } from "./server.constants.ts";

export type ModelCatalogueInput = {
  readonly config: ServerConfig;
  readonly modelProviderStore: ModelProviderStore;
  readonly secretVault: SecretVault;
  readonly clock: SystemClock;
};

export type ModelLayer = {
  readonly modelCatalogue: OpenedModelCatalogue;
  readonly refreshModelCatalogue: RefreshModelCatalogue;
};

// Providers saved in Settings are applied at start and whenever they change; WORK_OS_LMSTUDIO_URL seeds one the first time.
export const openModelCatalogue = async (input: ModelCatalogueInput): Promise<ModelLayer | WorkOsError> => {
  const scriptedProviders = readScriptedProviders(input.config.scriptedResponses);
  if (scriptedProviders instanceof WorkOsError) return scriptedProviders;

  const modelCatalogue = createModelCatalogue({ extraProviders: scriptedProviders, environment: process.env });
  const refreshModelCatalogue = createRefreshModelCatalogue({ modelProviderStore: input.modelProviderStore, secretVault: input.secretVault, modelCatalogue: modelCatalogue.catalogue });

  const seeded = await seedLmStudio(input);
  if (seeded instanceof WorkOsError) return seeded;

  const refreshed = await refreshModelCatalogue();
  if (refreshed instanceof WorkOsError) return refreshed;
  return { modelCatalogue, refreshModelCatalogue };
};

const seedLmStudio = async (input: ModelCatalogueInput): Promise<WorkOsError | undefined> => {
  const { lmStudioUrl } = input.config;
  if (lmStudioUrl === null) return undefined;

  const existing = await input.modelProviderStore.findModelProvider(FIXED_PROVIDER_IDS.lmStudio);
  if (!(existing instanceof NotFoundError)) return existing instanceof WorkOsError ? existing : undefined;

  const saved = await input.modelProviderStore.saveModelProvider({
    id: FIXED_PROVIDER_IDS.lmStudio,
    kind: "lmStudio",
    name: LM_STUDIO_SEED_NAME,
    baseUrl: lmStudioUrl,
    hasApiKey: false,
    sealedApiKey: null,
    createdAt: input.clock.now(),
  });
  return saved instanceof WorkOsError ? saved : undefined;
};

const readScriptedProviders = (scriptedResponses: string | null) => {
  if (scriptedResponses === null) return [];

  const json = tryCatch((): unknown => JSON.parse(scriptedResponses));
  const responses = parseWithSchema(ScriptedResponsesSchema, json, "WORK_OS_SCRIPTED_RESPONSES");
  if (responses instanceof WorkOsError) return responses;

  return [createScriptedProvider(responses)];
};
