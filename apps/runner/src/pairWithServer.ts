import type { RunnerCredentials } from "@work-os/config/RunnerCredentials";
import type { RunnerPlatform } from "@work-os/domain/runners/Runner";
import { PairRunnerResponseSchema } from "@work-os/protocol/api/runners.schema";
import { InvalidRequestError } from "@work-os/shared/InvalidRequestError";
import { tryCatchAsync } from "@work-os/shared/tryCatch";
import { WorkOsError } from "@work-os/shared/WorkOsError";

export type PairingRequest = {
  readonly serverUrl: string;
  readonly code: string;
  readonly name: string;
  readonly platform: RunnerPlatform;
};

export const pairWithServer = async (pairing: PairingRequest): Promise<RunnerCredentials | WorkOsError> => {
  const body = JSON.stringify({ code: pairing.code, name: pairing.name, platform: pairing.platform });
  const response = await tryCatchAsync(() =>
    fetch(new URL("/api/runners/pair", pairing.serverUrl), { method: "POST", headers: { "content-type": "application/json" }, body }),
  );
  if (response instanceof WorkOsError) return response;

  const json = await tryCatchAsync((): Promise<unknown> => response.json());
  const paired = PairRunnerResponseSchema.safeParse(json);
  if (!paired.success) return new InvalidRequestError(`Pairing failed (${response.status}): ${JSON.stringify(json)}`);
  return { serverUrl: pairing.serverUrl, runnerId: paired.data.runnerId, token: paired.data.token };
};
