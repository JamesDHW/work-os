import { useRouter } from "@tanstack/react-router";
import { useState, type ChangeEvent, type MouseEvent } from "react";

import { apiClient } from "../../api/client.ts";
import { describeFailure } from "../../api/describeFailure.ts";

export type ConnectionsSectionModel = {
  readonly kind: string;
  readonly label: string;
  readonly secret: string;
  readonly errorMessage: string | null;
  readonly isBusy: boolean;
  readonly handleKindChange: (event: ChangeEvent<HTMLSelectElement>) => void;
  readonly handleLabelChange: (event: ChangeEvent<HTMLInputElement>) => void;
  readonly handleSecretChange: (event: ChangeEvent<HTMLInputElement>) => void;
  readonly handleAddClick: () => Promise<void>;
  readonly handleRemoveClick: (event: MouseEvent<HTMLButtonElement>) => Promise<void>;
};

export const useConnectionsSection = (workspaceId: string, initialKind: string): ConnectionsSectionModel => {
  const router = useRouter();
  const [kind, setKind] = useState(initialKind);
  const [label, setLabel] = useState("");
  const [secret, setSecret] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const params = { path: { workspaceId } };

  const addConnection = async (): Promise<void> => {
    setIsBusy(true);
    const result = await apiClient.POST("/api/w/{workspaceId}/connections", { params, body: { kind, label, secret } });
    setIsBusy(false);
    const failure = describeFailure(result);
    setErrorMessage(failure);
    if (failure === null) {
      setSecret("");
    }
    await router.invalidate();
  };

  const removeConnection = async (event: MouseEvent<HTMLButtonElement>): Promise<void> => {
    const connectionId = event.currentTarget.value;
    const result = await apiClient.DELETE("/api/w/{workspaceId}/connections/{connectionId}", { params: { path: { workspaceId, connectionId } } });
    setErrorMessage(describeFailure(result));
    await router.invalidate();
  };

  return {
    kind,
    label,
    secret,
    errorMessage,
    isBusy,
    handleKindChange: (event) => setKind(event.target.value),
    handleLabelChange: (event) => setLabel(event.target.value),
    handleSecretChange: (event) => setSecret(event.target.value),
    handleAddClick: addConnection,
    handleRemoveClick: removeConnection,
  };
};
