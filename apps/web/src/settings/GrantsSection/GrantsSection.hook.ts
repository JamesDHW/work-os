import { useRouter } from "@tanstack/react-router";
import { useState, type MouseEvent } from "react";

import { apiClient } from "../../api/client.ts";
import { describeFailure } from "../../api/describeFailure.ts";
import { startAction } from "../../api/startAction.ts";

export type GrantsSectionModel = {
  readonly errorMessage: string | null;
  readonly handleRevokeClick: (event: MouseEvent<HTMLButtonElement>) => void;
};

export const useGrantsSection = (workspaceId: string): GrantsSectionModel => {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const revoke = async (event: MouseEvent<HTMLButtonElement>): Promise<void> => {
    const grantId = event.currentTarget.value;
    const result = await apiClient.DELETE("/api/w/{workspaceId}/grants/{grantId}", { params: { path: { workspaceId, grantId } } });
    setErrorMessage(describeFailure(result));
    await router.invalidate();
  };

  return { errorMessage, handleRevokeClick: startAction(revoke) };
};
