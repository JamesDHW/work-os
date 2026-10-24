import { UnauthenticatedError } from "@work-os/shared/UnauthenticatedError";
import { WorkOsError } from "@work-os/shared/WorkOsError";

import type { SystemClock } from "../system/SystemClock.ts";
import type { IssueSession } from "./issueSession.ts";
import type { SignInCodes } from "./SignInCodes.ts";
import type { UserStore } from "./UserStore.ts";

type SignInWithCodeDependencies = {
  readonly signInCodes: SignInCodes;
  readonly userStore: Pick<UserStore, "findFirstUser">;
  readonly issueSession: IssueSession;
  readonly clock: SystemClock;
};

export type SignInWithCode = (code: string) => Promise<string | WorkOsError>;

// Recovery for an account whose passkeys are unusable: the code proves command access to the server's machine.
export const createSignInWithCode = (dependencies: SignInWithCodeDependencies): SignInWithCode => {
  return async (code) => {
    const issued = await dependencies.signInCodes.readSignInCode();
    if (issued instanceof WorkOsError) return issued;
    if (issued === null) return new UnauthenticatedError("No sign-in code is active. Run `work-os sign-in-code` on the server's machine.");

    const isExpired = issued.expiresAt <= dependencies.clock.now();
    const isMatch = !isExpired && issued.code === code.trim().toUpperCase();
    const consumed = await dependencies.signInCodes.consumeSignInCode();
    if (consumed instanceof WorkOsError) return consumed;
    if (!isMatch) return new UnauthenticatedError("That sign-in code is wrong or has expired. Run `work-os sign-in-code` again.");

    const user = await dependencies.userStore.findFirstUser();
    if (user instanceof WorkOsError) return user;
    return dependencies.issueSession(user.id);
  };
};
