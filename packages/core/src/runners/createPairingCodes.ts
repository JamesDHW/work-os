import type { WorkspaceId } from "@work-os/domain/identifiers/Identifiers";
import { NotFoundError } from "@work-os/shared/NotFoundError";

import type { RandomSource } from "../system/RandomSource.ts";
import type { SystemClock } from "../system/SystemClock.ts";
import type { IssuedPairingCode, PairingCodes } from "./PairingCodes.ts";
import { PAIRING_CODE_LIFETIME_MILLISECONDS } from "./runners.constants.ts";

type PendingPairing = {
  readonly workspaceId: WorkspaceId;
  readonly expiresAt: string;
};

type CreatePairingCodesDependencies = {
  readonly randomSource: Pick<RandomSource, "createPairingCode">;
  readonly clock: SystemClock;
};

export const createPairingCodes = (dependencies: CreatePairingCodesDependencies): PairingCodes => {
  const pendingByCode = new Map<string, PendingPairing>();

  const issuePairingCode = (workspaceId: WorkspaceId): IssuedPairingCode => {
    const code = dependencies.randomSource.createPairingCode();
    const expiresAt = new Date(Date.parse(dependencies.clock.now()) + PAIRING_CODE_LIFETIME_MILLISECONDS).toISOString();
    pendingByCode.set(code, { workspaceId, expiresAt });
    return { code, expiresAt };
  };

  const redeemPairingCode = (code: string): WorkspaceId | NotFoundError => {
    const pending = pendingByCode.get(code);
    pendingByCode.delete(code);
    const isUsable = pending !== undefined && pending.expiresAt > dependencies.clock.now();
    if (!isUsable) return new NotFoundError("The pairing code is unknown or has expired.");

    return pending.workspaceId;
  };

  return { issuePairingCode, redeemPairingCode };
};
