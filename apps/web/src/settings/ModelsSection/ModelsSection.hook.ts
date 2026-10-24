import { useRouter } from "@tanstack/react-router";
import { useState, type ChangeEvent } from "react";

import type { ModelProviderKind } from "../../api/apiTypes.ts";
import { apiClient } from "../../api/client.ts";
import { describeFailure } from "../../api/describeFailure.ts";
import { FIXED_PROVIDER_IDS, PROVIDER_KINDS } from "./models.constants.ts";

export type ModelsSectionModel = {
  readonly kind: ModelProviderKind;
  readonly providerId: string;
  readonly name: string;
  readonly baseUrl: string;
  readonly apiKey: string;
  readonly selectedDefault: string;
  readonly errorMessage: string | null;
  readonly isBusy: boolean;
  readonly needsUrl: boolean;
  readonly needsId: boolean;
  readonly handleKindChange: (event: ChangeEvent<HTMLSelectElement>) => void;
  readonly handleProviderIdChange: (event: ChangeEvent<HTMLInputElement>) => void;
  readonly handleNameChange: (event: ChangeEvent<HTMLInputElement>) => void;
  readonly handleBaseUrlChange: (event: ChangeEvent<HTMLInputElement>) => void;
  readonly handleApiKeyChange: (event: ChangeEvent<HTMLInputElement>) => void;
  readonly handleDefaultChange: (event: ChangeEvent<HTMLSelectElement>) => void;
  readonly handleSaveProviderClick: () => Promise<void>;
  readonly handleRemoveClick: (providerId: string) => () => Promise<void>;
  readonly handleSaveDefaultClick: () => Promise<void>;
};

export const useModelsSection = (workspaceId: string, currentDefault: string): ModelsSectionModel => {
  const router = useRouter();
  const [kind, setKind] = useState<ModelProviderKind>("lmStudio");
  const [providerId, setProviderId] = useState("");
  const [name, setName] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [selectedDefault, setSelectedDefault] = useState(currentDefault);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const needsUrl = kind !== "anthropic";
  const needsId = kind === "openaiCompatible";

  const saveProvider = async (): Promise<void> => {
    setIsBusy(true);
    const id = needsId ? providerId.trim() : FIXED_PROVIDER_IDS[kind];
    const body = { kind, name: name.trim().length > 0 ? name.trim() : id, baseUrl: needsUrl ? baseUrl.trim() : null, ...(apiKey.length > 0 ? { apiKey } : {}) };
    const result = await apiClient.PUT("/api/models/providers/{providerId}", { params: { path: { providerId: id } }, body });
    setIsBusy(false);
    const failure = describeFailure(result);
    setErrorMessage(failure);
    if (failure === null) {
      setApiKey("");
    }
    await router.invalidate();
  };

  const removeProvider = async (id: string): Promise<void> => {
    const result = await apiClient.DELETE("/api/models/providers/{providerId}", { params: { path: { providerId: id } } });
    setErrorMessage(describeFailure(result));
    await router.invalidate();
  };

  const saveDefault = async (): Promise<void> => {
    setIsBusy(true);
    const result = await apiClient.PUT("/api/w/{workspaceId}/models/default", { params: { path: { workspaceId } }, body: { model: selectedDefault } });
    setIsBusy(false);
    setErrorMessage(describeFailure(result));
    await router.invalidate();
  };

  return {
    kind,
    providerId,
    name,
    baseUrl,
    apiKey,
    selectedDefault,
    errorMessage,
    isBusy,
    needsUrl,
    needsId,
    handleKindChange: (event) => setKind(PROVIDER_KINDS.find((candidate) => candidate === event.target.value) ?? "lmStudio"),
    handleProviderIdChange: (event) => setProviderId(event.target.value),
    handleNameChange: (event) => setName(event.target.value),
    handleBaseUrlChange: (event) => setBaseUrl(event.target.value),
    handleApiKeyChange: (event) => setApiKey(event.target.value),
    handleDefaultChange: (event) => setSelectedDefault(event.target.value),
    handleSaveProviderClick: saveProvider,
    handleRemoveClick: (id) => async () => removeProvider(id),
    handleSaveDefaultClick: saveDefault,
  };
};
