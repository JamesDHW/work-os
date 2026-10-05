import { useNavigate } from "@tanstack/react-router";
import { useState, type ChangeEvent, type FormEvent } from "react";

import { apiClient } from "../../api/client.ts";
import { captureFailure } from "../../api/captureFailure.ts";
import { describeFailure } from "../../api/describeFailure.ts";
import { registerPasskey } from "../registerPasskey.ts";
import { signInWithPasskey } from "../signInWithPasskey.ts";

export type SignInStep = "signIn" | "setup" | "createPasskey";

export type SignInScreenModel = {
  readonly step: SignInStep;
  readonly setupCode: string;
  readonly displayName: string;
  readonly errorMessage: string | null;
  readonly isBusy: boolean;
  readonly handleSetupCodeChange: (event: ChangeEvent<HTMLInputElement>) => void;
  readonly handleDisplayNameChange: (event: ChangeEvent<HTMLInputElement>) => void;
  readonly handleSetupSubmit: (event: FormEvent) => Promise<void>;
  readonly handlePasskeySignInClick: () => Promise<void>;
  readonly handleCreatePasskeyClick: () => Promise<void>;
  readonly handleSkipPasskeyClick: () => Promise<void>;
};

export const useSignInScreen = (isSetUp: boolean): SignInScreenModel => {
  const navigate = useNavigate();
  const [step, setStep] = useState<SignInStep>(isSetUp ? "signIn" : "setup");
  const [setupCode, setSetupCode] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  const runStep = async (operation: () => Promise<string | null>, onSuccess: () => Promise<void>): Promise<void> => {
    setIsBusy(true);
    const failure = await captureFailure(operation);
    setIsBusy(false);
    setErrorMessage(failure);
    if (failure === null) {
      await onSuccess();
    }
  };
  const goHome = async (): Promise<void> => navigate({ to: "/" });

  const submitSetup = async (event: FormEvent): Promise<void> => {
    event.preventDefault();
    const completeSetup = async () => describeFailure(await apiClient.POST("/api/setup", { body: { setupCode, displayName } }));
    await runStep(completeSetup, async () => setStep("createPasskey"));
  };

  return {
    step,
    setupCode,
    displayName,
    errorMessage,
    isBusy,
    handleSetupCodeChange: (event) => setSetupCode(event.target.value),
    handleDisplayNameChange: (event) => setDisplayName(event.target.value),
    handleSetupSubmit: submitSetup,
    handlePasskeySignInClick: async () => runStep(signInWithPasskey, goHome),
    handleCreatePasskeyClick: async () => runStep(registerPasskey, goHome),
    handleSkipPasskeyClick: goHome,
  };
};
