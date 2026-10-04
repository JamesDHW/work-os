import type { WorkOsError } from "@work-os/shared/WorkOsError";

export type SecretVault = {
  readonly sealSecret: (secret: string) => Promise<string | WorkOsError>;
  readonly openSecret: (sealedSecret: string) => Promise<string | WorkOsError>;
};
