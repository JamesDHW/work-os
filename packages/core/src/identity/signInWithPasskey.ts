import { NotFoundError } from "@work-os/shared/NotFoundError";
import { UnauthenticatedError } from "@work-os/shared/UnauthenticatedError";
import { WorkOsError } from "@work-os/shared/WorkOsError";

import type { IssueSession } from "./issueSession.ts";
import type { Passkey, PasskeyStore } from "./PasskeyStore.ts";

export type VerifyPasskeyAssertion = (passkey: Passkey) => Promise<number | WorkOsError>;

export type SignInWithPasskeyInput = {
  readonly credentialId: string;
  readonly verifyAssertion: VerifyPasskeyAssertion;
};

type SignInWithPasskeyDependencies = {
  readonly passkeyStore: Pick<PasskeyStore, "findPasskey" | "updatePasskeyCounter">;
  readonly issueSession: IssueSession;
};

export type SignInWithPasskey = (input: SignInWithPasskeyInput) => Promise<string | WorkOsError>;

export const createSignInWithPasskey = (dependencies: SignInWithPasskeyDependencies): SignInWithPasskey => {
  return async (input) => {
    const passkey = await dependencies.passkeyStore.findPasskey(input.credentialId);
    if (passkey instanceof NotFoundError) return new UnauthenticatedError("This passkey is not registered with work-os.");
    if (passkey instanceof WorkOsError) return passkey;

    const newCounter = await input.verifyAssertion(passkey);
    if (newCounter instanceof WorkOsError) return new UnauthenticatedError("The passkey could not be verified.", { cause: newCounter });

    const updated = await dependencies.passkeyStore.updatePasskeyCounter(passkey.credentialId, newCounter);
    if (updated instanceof WorkOsError) return updated;

    return dependencies.issueSession(passkey.userId);
  };
};
