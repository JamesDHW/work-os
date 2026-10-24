import { useNavigate } from "@tanstack/react-router";
import { useState, type ChangeEvent, type FormEvent } from "react";

import { apiClient } from "../../api/client.ts";
import { captureFailure } from "../../api/captureFailure.ts";
import { describeFailure } from "../../api/describeFailure.ts";
import { registerPasskey } from "../registerPasskey.ts";
import { signInWithPasskey } from "../signInWithPasskey.ts";

export type SignInStep = "signIn" | "signInCode" | "setup" | "createPasskey";

export type SignInScreenModel = {
  readonly step: SignInStep;
  readonly setupCode: string;
  readonly signInCode: string;
  readonly displayName: string;
  readonly errorMessage: string | null;
  readonly isBusy: boolean;
  /** Set when this page was opened at an address other than the one passkeys were created on. */
  readonly expectedOrigin: string | null;
  readonly handleSetupCodeChange: (event: ChangeEvent<HTMLInputElement>) => void;
  readonly handleSignInCodeChange: (event: ChangeEvent<HTMLInputElement>) => void;
  readonly handleDisplayNameChange: (event: ChangeEvent<HTMLInputElement>) => void;
  readonly handleSetupSubmit: (event: FormEvent) => Promise<void>;
  readonly handleSignInCodeSubmit: (event: FormEvent) => Promise<void>;
  readonly handlePasskeySignInClick: () => Promise<void>;
  readonly handleUseCodeClick: () => void;
  readonly handleBackClick: () => void;
  readonly handleCreatePasskeyClick: () => Promise<void>;
  readonly handleSkipPasskeyClick: () => Promise<void>;
};

export const useSignInScreen = (isSetUp: boolean, publicOrigin: string): SignInScreenModel => {
  const navigate = useNavigate();
  const [step, setStep] = useState<SignInStep>(isSetUp ? "signIn" : "setup");
  const [setupCode, setSetupCode] = useState("");
  const [signInCode, setSignInCode] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const expectedOrigin = window.location.origin === publicOrigin ? null : publicOrigin;

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
  const goToCreatePasskey = async (): Promise<void> => setStep("createPasskey");

  const submitSetup = async (event: FormEvent): Promise<void> => {
    event.preventDefault();
    const completeSetup = async () => describeFailure(await apiClient.POST("/api/setup", { body: { setupCode, displayName } }));
    await runStep(completeSetup, goToCreatePasskey);
  };

  const submitSignInCode = async (event: FormEvent): Promise<void> => {
    event.preventDefault();
    const signIn = async () => describeFailure(await apiClient.POST("/api/sign-in-code", { body: { code: signInCode } }));
    await runStep(signIn, goToCreatePasskey);
  };

  return {
    step,
    setupCode,
    signInCode,
    displayName,
    errorMessage,
    isBusy,
    expectedOrigin,
    handleSetupCodeChange: (event) => setSetupCode(event.target.value),
    handleSignInCodeChange: (event) => setSignInCode(event.target.value),
    handleDisplayNameChange: (event) => setDisplayName(event.target.value),
    handleSetupSubmit: submitSetup,
    handleSignInCodeSubmit: submitSignInCode,
    handlePasskeySignInClick: async () => runStep(signInWithPasskey, goHome),
    handleUseCodeClick: () => setStep("signInCode"),
    handleBackClick: () => setStep("signIn"),
    handleCreatePasskeyClick: async () => runStep(registerPasskey, goHome),
    handleSkipPasskeyClick: goHome,
  };
};
