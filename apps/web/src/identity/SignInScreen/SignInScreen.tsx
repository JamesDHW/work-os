import type { FC } from "react";

import { Button } from "../../ui/Button/Button.tsx";
import { Card } from "../../ui/Card/Card.tsx";
import { ErrorNotice } from "../../ui/ErrorNotice/ErrorNotice.tsx";
import { Field } from "../../ui/Field/Field.tsx";
import { TextInput } from "../../ui/Field/TextInput.tsx";
import { Heading, MutedText } from "../../ui/Heading/Heading.tsx";
import { Stack } from "../../ui/Stack/Stack.tsx";
import { page, panel } from "./SignInScreen.css.ts";
import { useSignInScreen, type SignInScreenModel } from "./SignInScreen.hook.ts";

export type SignInScreenProps = {
  readonly isSetUp: boolean;
  readonly publicOrigin: string;
};

export const SignInScreen: FC<SignInScreenProps> = ({ isSetUp, publicOrigin }) => {
  const model = useSignInScreen(isSetUp, publicOrigin);

  return (
    <div className={page}>
      <div className={panel}>
        <Card>
          <Heading level="page">work-os</Heading>
          {model.expectedOrigin === null ? null : (
            <MutedText>
              This work-os expects to be opened at {model.expectedOrigin}. Passkeys only work there, so sign in from that address.
            </MutedText>
          )}
          <SignInStepContent model={model} />
          <ErrorNotice message={model.errorMessage} />
        </Card>
      </div>
    </div>
  );
};

type SignInStepContentProps = {
  readonly model: SignInScreenModel;
};

const SignInStepContent: FC<SignInStepContentProps> = ({ model }) => {
  switch (model.step) {
    case "signIn":
      return (
        <Stack>
          <MutedText>Sign in with the passkey on this device.</MutedText>
          <Button tone="primary" disabled={model.isBusy} onClick={model.handlePasskeySignInClick}>
            Sign in with a passkey
          </Button>
          <Button tone="ghost" onClick={model.handleUseCodeClick}>
            Use a sign-in code instead
          </Button>
        </Stack>
      );
    case "signInCode":
      return (
        <form onSubmit={model.handleSignInCodeSubmit}>
          <Stack>
            <MutedText>On the machine that runs the server, run `work-os sign-in-code` and enter the code it prints. You can add a passkey afterwards.</MutedText>
            <Field label="Sign-in code">
              <TextInput value={model.signInCode} onChange={model.handleSignInCodeChange} autoComplete="off" />
            </Field>
            <Stack direction="row">
              <Button tone="primary" type="submit" disabled={model.isBusy || model.signInCode.trim().length === 0}>
                Sign in
              </Button>
              <Button tone="ghost" type="button" onClick={model.handleBackClick}>
                Back
              </Button>
            </Stack>
          </Stack>
        </form>
      );
    case "setup":
      return (
        <form onSubmit={model.handleSetupSubmit}>
          <Stack>
            <MutedText>Enter the setup code from the server log to create the first account.</MutedText>
            <Field label="Setup code">
              <TextInput value={model.setupCode} onChange={model.handleSetupCodeChange} autoComplete="off" />
            </Field>
            <Field label="Your name">
              <TextInput value={model.displayName} onChange={model.handleDisplayNameChange} />
            </Field>
            <Button tone="primary" type="submit" disabled={model.isBusy}>
              Create account
            </Button>
          </Stack>
        </form>
      );
    case "createPasskey":
      return (
        <Stack>
          <MutedText>Create a passkey so you can sign in from this and your other devices. It only works at this address.</MutedText>
          <Stack direction="row">
            <Button tone="primary" disabled={model.isBusy} onClick={model.handleCreatePasskeyClick}>
              Create a passkey
            </Button>
            <Button tone="ghost" onClick={model.handleSkipPasskeyClick}>
              Later
            </Button>
          </Stack>
          <MutedText>Without a passkey, the only way back in is `work-os sign-in-code` on the server&apos;s machine.</MutedText>
        </Stack>
      );
    default:
      return model.step satisfies never;
  }
};
