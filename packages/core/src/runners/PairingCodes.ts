import type { WorkspaceId } from "@work-os/domain/identifiers/Identifiers";
import type { NotFoundError } from "@work-os/shared/NotFoundError";

export type IssuedPairingCode = {
  readonly code: string;
  readonly expiresAt: string;
};

export type PairingCodes = {
  readonly issuePairingCode: (workspaceId: WorkspaceId) => IssuedPairingCode;
  readonly redeemPairingCode: (code: string) => WorkspaceId | NotFoundError;
};
