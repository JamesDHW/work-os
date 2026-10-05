import { useState } from "react";

import { apiClient } from "../../api/client.ts";
import { describeFailure } from "../../api/describeFailure.ts";
import { startAction } from "../../api/startAction.ts";

export type PairingCode = {
  readonly code: string;
  readonly expiresAt: string;
};

export type MachinesSectionModel = {
  readonly pairingCode: PairingCode | null;
  readonly errorMessage: string | null;
  readonly isBusy: boolean;
  readonly handlePairClick: () => void;
};

export const useMachinesSection = (workspaceId: string): MachinesSectionModel => {
  const [pairingCode, setPairingCode] = useState<PairingCode | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  const createPairingCode = async (): Promise<void> => {
    setIsBusy(true);
    const result = await apiClient.POST("/api/w/{workspaceId}/runners/pairing-codes", { params: { path: { workspaceId } } });
    setIsBusy(false);
    setErrorMessage(describeFailure(result));
    setPairingCode(result.data ?? null);
  };

  return { pairingCode, errorMessage, isBusy, handlePairClick: startAction(createPairingCode) };
};
