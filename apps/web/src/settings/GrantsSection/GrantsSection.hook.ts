import { useRouter } from "@tanstack/react-router";
import { useState } from "react";

import { apiClient } from "../../api/client.ts";
import { describeFailure } from "../../api/describeFailure.ts";

export type GrantsSectionModel = {
  readonly errorMessage: string | null;
  readonly handleRevokeClick: (grantId: string) => () => Promise<void>;
};

export const useGrantsSection = (workspaceId: string): GrantsSectionModel => {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const revoke = async (grantId: string): Promise<void> => {
    const result = await apiClient.DELETE("/api/w/{workspaceId}/grants/{grantId}", { params: { path: { workspaceId, grantId } } });
    setErrorMessage(describeFailure(result));
    await router.invalidate();
  };

  return { errorMessage, handleRevokeClick: (grantId) => async () => revoke(grantId) };
};
