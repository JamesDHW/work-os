import { chooseDefaultModel, isModelAvailable } from "@work-os/domain/models/chooseDefaultModel";
import { FIXED_PROVIDER_IDS } from "@work-os/domain/models/modelProviders.constants";
import { tryCatchAsync } from "@work-os/shared/tryCatch";
import { WorkOsError } from "@work-os/shared/WorkOsError";

import { LM_STUDIO_DEFAULT_URL } from "../../cli.constants.ts";
import { writeLine } from "../../writeLine.ts";
import { LM_STUDIO_PROBE_TIMEOUT_MILLISECONDS } from "./dev.constants.ts";
import { devClient, type DevSession } from "./devSession.ts";

export type DevModelsInput = {
  readonly session: DevSession;
  readonly workspaceId: string;
};

// A dev server picks up a local LM Studio by itself and points the workspace at a model that actually exists.
export const ensureDevModels = async (input: DevModelsInput): Promise<WorkOsError | undefined> => {
  const client = devClient(input.session);
  const registered = await registerLmStudio(client);
  if (registered instanceof WorkOsError) return registered;

  const models = await tryCatchAsync(async () => client.GET("/api/models"));
  if (models instanceof WorkOsError) return models;

  const available = models.data?.models ?? [];
  if (available.length === 0) {
    writeLine("No model provider is configured. Add one in Settings > Models (LM Studio, an Anthropic key, or an OpenAI-compatible endpoint); runs cannot start until then.");
    return undefined;
  }

  const current = await tryCatchAsync(async () => client.GET("/api/w/{workspaceId}/models/default", { params: { path: { workspaceId: input.workspaceId } } }));
  if (current instanceof WorkOsError) return current;

  const currentDefault = current.data?.model;
  const isCurrentUsable = currentDefault !== undefined && isModelAvailable(currentDefault, available);
  if (isCurrentUsable) return undefined;

  const chosen = chooseDefaultModel(available, available[0]?.reference ?? "");
  const saved = await tryCatchAsync(async () => client.PUT("/api/w/{workspaceId}/models/default", { params: { path: { workspaceId: input.workspaceId } }, body: { model: chosen } }));
  if (saved instanceof WorkOsError) return saved;

  writeLine(`Default model: ${chosen} (change it in Settings > Models).`);
  return undefined;
};

const registerLmStudio = async (client: ReturnType<typeof devClient>): Promise<WorkOsError | undefined> => {
  const providers = await tryCatchAsync(async () => client.GET("/api/models/providers"));
  if (providers instanceof WorkOsError) return providers;

  const hasLmStudio = (providers.data ?? []).some((provider) => provider.id === FIXED_PROVIDER_IDS.lmStudio);
  if (hasLmStudio) return undefined;

  const isReachable = await isLmStudioReachable();
  if (!isReachable) return undefined;

  writeLine(`LM Studio answers at ${LM_STUDIO_DEFAULT_URL}; adding it as a model provider.`);
  const saved = await tryCatchAsync(async () =>
    client.PUT("/api/models/providers/{providerId}", {
      params: { path: { providerId: FIXED_PROVIDER_IDS.lmStudio } },
      body: { kind: "lmStudio", name: "LM Studio", baseUrl: LM_STUDIO_DEFAULT_URL, apiKey: "" },
    }),
  );
  return saved instanceof WorkOsError ? saved : undefined;
};

const isLmStudioReachable = async (): Promise<boolean> => {
  const response = await tryCatchAsync(() => fetch(`${LM_STUDIO_DEFAULT_URL}/models`, { signal: AbortSignal.timeout(LM_STUDIO_PROBE_TIMEOUT_MILLISECONDS) }));
  return !(response instanceof WorkOsError) && response.ok;
};
