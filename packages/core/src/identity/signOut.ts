import type { WorkOsError } from "@work-os/shared/WorkOsError";

import type { RandomSource } from "../system/RandomSource.ts";
import type { SessionStore } from "./SessionStore.ts";

type SignOutDependencies = {
  readonly sessionStore: Pick<SessionStore, "deleteSession">;
  readonly randomSource: Pick<RandomSource, "hashToken">;
};

export type SignOut = (token: string) => Promise<WorkOsError | undefined>;

export const createSignOut = (dependencies: SignOutDependencies): SignOut => {
  return async (token) => dependencies.sessionStore.deleteSession(dependencies.randomSource.hashToken(token));
};
