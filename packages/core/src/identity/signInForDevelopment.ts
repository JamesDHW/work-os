import { ForbiddenError } from "@work-os/shared/ForbiddenError";
import { WorkOsError } from "@work-os/shared/WorkOsError";

import type { IssueSession } from "./issueSession.ts";
import type { UserStore } from "./UserStore.ts";

type SignInForDevelopmentDependencies = {
  readonly isEnabled: boolean;
  readonly userStore: Pick<UserStore, "findFirstUser">;
  readonly issueSession: IssueSession;
};

export type SignInForDevelopment = () => Promise<string | WorkOsError>;

// `work-os dev` runs a server that only listens on this machine; signing its one account in without a passkey
// keeps passkeys a production concern. The server refuses this unless it was started with that flag.
export const createSignInForDevelopment = (dependencies: SignInForDevelopmentDependencies): SignInForDevelopment => {
  return async () => {
    if (!dependencies.isEnabled) return new ForbiddenError("Automatic sign-in is only available to a development server.");

    const user = await dependencies.userStore.findFirstUser();
    if (user instanceof WorkOsError) return user;
    return dependencies.issueSession(user.id);
  };
};
