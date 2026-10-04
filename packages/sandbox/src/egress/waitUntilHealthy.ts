import { UnavailableError } from "@work-os/shared/UnavailableError";
import type { WorkOsError } from "@work-os/shared/WorkOsError";

import { GATEWAY_HEALTH_ATTEMPTS, GATEWAY_HEALTH_INTERVAL_MILLISECONDS } from "../sandbox.constants.ts";
import type { GatewayClient } from "./createGatewayClient.ts";

export const waitUntilHealthy = async (gateway: Pick<GatewayClient, "isHealthy">): Promise<WorkOsError | undefined> => {
  const attempts = Array.from({ length: GATEWAY_HEALTH_ATTEMPTS }, (_, index) => index);
  for (const attempt of attempts) {
    const isHealthy = await isHealthyAfterDelay(gateway, attempt);
    if (isHealthy) return undefined;
  }
  return new UnavailableError("The egress gateway did not become healthy. Check `docker logs work-os-egress-gateway`.");
};

const isHealthyAfterDelay = async (gateway: Pick<GatewayClient, "isHealthy">, attempt: number): Promise<boolean> => {
  if (attempt > 0) {
    await new Promise((resolve) => setTimeout(resolve, GATEWAY_HEALTH_INTERVAL_MILLISECONDS));
  }
  return gateway.isHealthy();
};
