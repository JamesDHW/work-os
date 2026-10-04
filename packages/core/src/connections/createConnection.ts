import type { WorkspaceId } from "@work-os/domain/identifiers/Identifiers";
import { toConnectionId } from "@work-os/domain/identifiers/Identifiers";
import { WorkOsError } from "@work-os/shared/WorkOsError";

import type { RandomSource } from "../system/RandomSource.ts";
import type { SystemClock } from "../system/SystemClock.ts";
import type { Connection } from "./Connection.ts";
import type { ConnectionStore } from "./ConnectionStore.ts";
import type { SecretVault } from "./SecretVault.ts";

export type CreateConnectionInput = {
  readonly workspaceId: WorkspaceId;
  readonly kind: string;
  readonly label: string;
  readonly secret: string;
};

type CreateConnectionDependencies = {
  readonly connectionStore: Pick<ConnectionStore, "createConnection">;
  readonly secretVault: Pick<SecretVault, "sealSecret">;
  readonly randomSource: Pick<RandomSource, "createId">;
  readonly clock: SystemClock;
};

export type CreateConnection = (input: CreateConnectionInput) => Promise<Connection | WorkOsError>;

export const createCreateConnection = (dependencies: CreateConnectionDependencies): CreateConnection => {
  return async (input) => {
    const sealedSecret = await dependencies.secretVault.sealSecret(input.secret);
    if (sealedSecret instanceof WorkOsError) return sealedSecret;

    return dependencies.connectionStore.createConnection({
      id: toConnectionId(dependencies.randomSource.createId()),
      workspaceId: input.workspaceId,
      kind: input.kind,
      label: input.label,
      createdAt: dependencies.clock.now(),
      sealedSecret,
    });
  };
};
