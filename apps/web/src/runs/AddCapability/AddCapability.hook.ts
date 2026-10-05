import { useRouter } from "@tanstack/react-router";
import { useState, type ChangeEvent } from "react";

import { apiClient } from "../../api/client.ts";
import { describeFailure } from "../../api/describeFailure.ts";
import { startAction } from "../../api/startAction.ts";

export type AddCapabilityModel = {
  readonly capabilityId: string;
  readonly errorMessage: string | null;
  readonly isBusy: boolean;
  readonly handleCapabilityChange: (event: ChangeEvent<HTMLSelectElement>) => void;
  readonly handleAddClick: () => void;
};

export const useAddCapability = (workspaceId: string, runId: string, initialCapabilityId: string): AddCapabilityModel => {
  const router = useRouter();
  const [capabilityId, setCapabilityId] = useState(initialCapabilityId);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  const addCapability = async (): Promise<void> => {
    setIsBusy(true);
    const params = { path: { workspaceId, runId } };
    const result = await apiClient.POST("/api/w/{workspaceId}/runs/{runId}/capabilities", { params, body: { capabilityId } });
    setIsBusy(false);
    setErrorMessage(describeFailure(result));
    await router.invalidate();
  };

  return { capabilityId, errorMessage, isBusy, handleCapabilityChange: (event) => setCapabilityId(event.target.value), handleAddClick: startAction(addCapability) };
};
