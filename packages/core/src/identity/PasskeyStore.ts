import type { UserId } from "@work-os/domain/identifiers/Identifiers";
import type { NotFoundError } from "@work-os/shared/NotFoundError";
import type { WorkOsError } from "@work-os/shared/WorkOsError";

export type Passkey = {
  readonly credentialId: string;
  readonly userId: UserId;
  readonly publicKey: string;
  readonly counter: number;
  readonly transports: readonly string[];
  readonly createdAt: string;
};

export type PasskeyStore = {
  readonly savePasskey: (passkey: Passkey) => Promise<Passkey | WorkOsError>;
  readonly listPasskeysForUser: (userId: UserId) => Promise<readonly Passkey[] | WorkOsError>;
  readonly findPasskey: (credentialId: string) => Promise<Passkey | NotFoundError | WorkOsError>;
  readonly updatePasskeyCounter: (credentialId: string, counter: number) => Promise<WorkOsError | undefined>;
};
