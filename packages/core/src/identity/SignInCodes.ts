import type { WorkOsError } from "@work-os/shared/WorkOsError";

export type SignInCode = {
  readonly code: string;
  readonly expiresAt: string;
};

/** One-time codes written by `work-os sign-in-code` on the server's machine; consuming one removes it. */
export type SignInCodes = {
  readonly readSignInCode: () => Promise<SignInCode | null | WorkOsError>;
  readonly consumeSignInCode: () => Promise<WorkOsError | undefined>;
};
