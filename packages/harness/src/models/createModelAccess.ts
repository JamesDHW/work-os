import type { MutableModels, Provider } from "@earendil-works/pi-ai";
import { builtinModels } from "@earendil-works/pi-ai/providers/all";
import { tryCatchAsync } from "@work-os/shared/tryCatch";
import { WorkOsError } from "@work-os/shared/WorkOsError";

import { LM_STUDIO_PROVIDER_ID } from "../harness.constants.ts";
import { createLmStudioProvider } from "./createLmStudioProvider.ts";

export type ModelAccessOptions = {
  readonly lmStudioUrl: string | null;
  readonly extraProviders: readonly Provider[];
};

export const createModelAccess = async (options: ModelAccessOptions): Promise<MutableModels | WorkOsError> => {
  const models = builtinModels();
  for (const provider of options.extraProviders) {
    models.setProvider(provider);
  }
  if (options.lmStudioUrl === null) return models;

  models.setProvider(createLmStudioProvider(options.lmStudioUrl));
  const refreshed = await tryCatchAsync(() => models.refresh({ providers: [LM_STUDIO_PROVIDER_ID], allowNetwork: true }));
  if (refreshed instanceof WorkOsError) return refreshed;

  return models;
};
