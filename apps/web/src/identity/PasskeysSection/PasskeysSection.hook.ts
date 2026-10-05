import { useState } from "react";

import { captureFailure } from "../../api/captureFailure.ts";
import { registerPasskey } from "../registerPasskey.ts";

export type PasskeysSectionModel = {
  readonly message: string | null;
  readonly errorMessage: string | null;
  readonly isBusy: boolean;
  readonly handleAddClick: () => Promise<void>;
};

export const usePasskeysSection = (): PasskeysSectionModel => {
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  const addPasskey = async (): Promise<void> => {
    setIsBusy(true);
    const failure = await captureFailure(registerPasskey);
    setIsBusy(false);
    setErrorMessage(failure);
    setMessage(failure === null ? "Passkey added. You can sign in with it from this device." : null);
  };

  return { message, errorMessage, isBusy, handleAddClick: addPasskey };
};
