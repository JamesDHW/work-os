import { toRunnerId, type RunnerId } from "@work-os/domain/identifiers/Identifiers";
import type { RunnerPlatform } from "@work-os/domain/runners/Runner";
import { WorkOsError } from "@work-os/shared/WorkOsError";

import type { EventBus } from "../events/EventBus.ts";
import type { RandomSource } from "../system/RandomSource.ts";
import type { SystemClock } from "../system/SystemClock.ts";
import type { PairingCodes } from "./PairingCodes.ts";
import type { RunnerStore } from "./RunnerStore.ts";

export type PairRunnerInput = {
  readonly code: string;
  readonly name: string;
  readonly platform: RunnerPlatform;
};

export type PairedRunner = {
  readonly runnerId: RunnerId;
  readonly token: string;
};

type PairRunnerDependencies = {
  readonly pairingCodes: Pick<PairingCodes, "redeemPairingCode">;
  readonly runnerStore: Pick<RunnerStore, "createRunner">;
  readonly eventBus: Pick<EventBus, "publish">;
  readonly randomSource: Pick<RandomSource, "createId" | "createToken" | "hashToken">;
  readonly clock: SystemClock;
};

export type PairRunner = (input: PairRunnerInput) => Promise<PairedRunner | WorkOsError>;

export const createPairRunner = (dependencies: PairRunnerDependencies): PairRunner => {
  return async (input) => {
    const workspaceId = dependencies.pairingCodes.redeemPairingCode(input.code);
    if (workspaceId instanceof WorkOsError) return workspaceId;

    const token = dependencies.randomSource.createToken();
    const runner = {
      id: toRunnerId(dependencies.randomSource.createId()),
      workspaceId,
      name: input.name,
      platform: input.platform,
      pairedAt: dependencies.clock.now(),
      lastSeenAt: null,
    };
    const created = await dependencies.runnerStore.createRunner(runner, dependencies.randomSource.hashToken(token));
    if (created instanceof WorkOsError) return created;

    dependencies.eventBus.publish({ kind: "runnersUpdated", workspaceId });
    return { runnerId: created.id, token };
  };
};
