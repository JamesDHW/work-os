import type { User } from "@work-os/domain/workspaces/User";
import { NotFoundError } from "@work-os/shared/NotFoundError";
import { UnauthenticatedError } from "@work-os/shared/UnauthenticatedError";
import { WorkOsError } from "@work-os/shared/WorkOsError";

import type { RandomSource } from "../system/RandomSource.ts";
import type { SystemClock } from "../system/SystemClock.ts";
import type { SessionStore } from "./SessionStore.ts";
import type { UserStore } from "./UserStore.ts";

type AuthenticateSessionDependencies = {
  readonly sessionStore: Pick<SessionStore, "findSession">;
  readonly userStore: Pick<UserStore, "findUser">;
  readonly randomSource: Pick<RandomSource, "hashToken">;
  readonly clock: SystemClock;
};

export type AuthenticateSession = (token: string) => Promise<User | WorkOsError>;

export const createAuthenticateSession = (dependencies: AuthenticateSessionDependencies): AuthenticateSession => {
  return async (token) => {
    const session = await dependencies.sessionStore.findSession(dependencies.randomSource.hashToken(token));
    if (session instanceof NotFoundError) return new UnauthenticatedError("Sign in to continue.");
    if (session instanceof WorkOsError) return session;

    const isExpired = session.expiresAt <= dependencies.clock.now();
    if (isExpired) return new UnauthenticatedError("Your session has expired. Sign in again.");

    return dependencies.userStore.findUser(session.userId);
  };
};
