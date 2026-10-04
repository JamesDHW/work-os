import type { UserId } from "@work-os/domain/identifiers/Identifiers";
import type { WorkOsError } from "@work-os/shared/WorkOsError";

import type { SystemClock } from "../system/SystemClock.ts";
import type { Passkey, PasskeyStore } from "./PasskeyStore.ts";

export type RegisterPasskeyInput = {
  readonly userId: UserId;
  readonly credentialId: string;
  readonly publicKey: string;
  readonly counter: number;
  readonly transports: readonly string[];
};

type RegisterPasskeyDependencies = {
  readonly passkeyStore: Pick<PasskeyStore, "savePasskey">;
  readonly clock: SystemClock;
};

export type RegisterPasskey = (input: RegisterPasskeyInput) => Promise<Passkey | WorkOsError>;

export const createRegisterPasskey = (dependencies: RegisterPasskeyDependencies): RegisterPasskey => {
  return async (input) => {
    return dependencies.passkeyStore.savePasskey({ ...input, createdAt: dependencies.clock.now() });
  };
};
