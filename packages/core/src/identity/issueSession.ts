import type { UserId } from "@work-os/domain/identifiers/Identifiers";
import { WorkOsError } from "@work-os/shared/WorkOsError";

import type { RandomSource } from "../system/RandomSource.ts";
import type { SystemClock } from "../system/SystemClock.ts";
import { MILLISECONDS_PER_DAY, SESSION_LIFETIME_DAYS } from "./identity.constants.ts";
import type { SessionStore } from "./SessionStore.ts";

type IssueSessionDependencies = {
  readonly sessionStore: Pick<SessionStore, "createSession">;
  readonly randomSource: Pick<RandomSource, "createToken" | "hashToken">;
  readonly clock: SystemClock;
};

export type IssueSession = (userId: UserId) => Promise<string | WorkOsError>;

export const createIssueSession = (dependencies: IssueSessionDependencies): IssueSession => {
  return async (userId) => {
    const token = dependencies.randomSource.createToken();
    const createdAt = dependencies.clock.now();
    const expiresAt = new Date(Date.parse(createdAt) + SESSION_LIFETIME_DAYS * MILLISECONDS_PER_DAY).toISOString();
    const session = { tokenHash: dependencies.randomSource.hashToken(token), userId, createdAt, expiresAt };

    const created = await dependencies.sessionStore.createSession(session);
    if (created instanceof WorkOsError) return created;

    return token;
  };
};
