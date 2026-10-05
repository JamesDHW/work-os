import type { UserId } from "@work-os/domain/identifiers/Identifiers";

import { CHALLENGE_LIFETIME_MILLISECONDS } from "../http/http.constants.ts";

type IssuedChallenge = {
  readonly userId: UserId | null;
  readonly expiresAt: number;
};

export type ChallengeStore = {
  readonly remember: (challenge: string, userId: UserId | null) => void;
  readonly consume: (challenge: string) => IssuedChallenge | undefined;
};

export const createChallengeStore = (now: () => number): ChallengeStore => {
  const challenges = new Map<string, IssuedChallenge>();

  return {
    remember: (challenge, userId) => {
      challenges.set(challenge, { userId, expiresAt: now() + CHALLENGE_LIFETIME_MILLISECONDS });
    },
    consume: (challenge) => {
      const issued = challenges.get(challenge);
      challenges.delete(challenge);
      const isFresh = issued !== undefined && issued.expiresAt > now();
      return isFresh ? issued : undefined;
    },
  };
};
