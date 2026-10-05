import { useRouter } from "@tanstack/react-router";
import { useState } from "react";

import { apiClient } from "../../api/client.ts";
import { describeFailure } from "../../api/describeFailure.ts";

export type RunScreenModel = {
  readonly errorMessage: string | null;
  readonly isStopping: boolean;
  readonly handleStopClick: () => Promise<void>;
};

export const useRunScreen = (workspaceId: string, runId: string): RunScreenModel => {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isStopping, setIsStopping] = useState(false);

  const stopRun = async (): Promise<void> => {
    setIsStopping(true);
    const result = await apiClient.POST("/api/w/{workspaceId}/runs/{runId}/stop", { params: { path: { workspaceId, runId } } });
    setIsStopping(false);
    setErrorMessage(describeFailure(result));
    await router.invalidate();
  };

  return { errorMessage, isStopping, handleStopClick: stopRun };
};
