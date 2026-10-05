import { WorkOsError } from "@work-os/shared/WorkOsError";

import { runDockerExpectingSuccess } from "../docker/runDocker.ts";
import { EGRESS_CONTROL_PORT, EGRESS_GATEWAY_CONTAINER, EGRESS_NETWORK } from "../sandbox.constants.ts";
import { createContainerAddresses } from "./containerAddresses.state.ts";
import { createGatewayClient, type GatewayClient } from "./createGatewayClient.ts";
import type { EgressController } from "./EgressController.ts";
import { waitUntilHealthy } from "./waitUntilHealthy.ts";

export type EgressControllerOptions = {
  readonly image: string;
  readonly token: string;
  readonly controlPort: number;
};

// The gateway starts once, when the controller is created; every caller awaits that same start.
export const createEgressController = (options: EgressControllerOptions): EgressController => {
  const gateway = createGatewayClient(`http://127.0.0.1:${options.controlPort}`, options.token);
  const containerAddresses = createContainerAddresses();
  const ready = startGateway(options, gateway);

  return {
    ensureReady: async () => ready,
    allow: async (grant) => {
      const sourceIp = await runDockerExpectingSuccess(["inspect", "--format", `{{(index .NetworkSettings.Networks "${EGRESS_NETWORK}").IPAddress}}`, grant.containerId]);
      if (sourceIp instanceof WorkOsError) return sourceIp;

      containerAddresses.remember(grant.containerId, sourceIp);
      return gateway.putAllowlist({ sourceIp, runId: grant.runId, hosts: grant.hosts });
    },
    revoke: async (containerId) => {
      const sourceIp = containerAddresses.forget(containerId);
      if (sourceIp === undefined) return undefined;
      return gateway.deleteAllowlist(sourceIp);
    },
    drainBlocked: async () => gateway.drainBlocked(),
  };
};

const startGateway = async (options: EgressControllerOptions, gateway: GatewayClient): Promise<WorkOsError | undefined> => {
  const network = await ensureNetwork();
  if (network instanceof WorkOsError) return network;

  await runDockerExpectingSuccess(["rm", "--force", EGRESS_GATEWAY_CONTAINER]);
  const runArguments = ["run", "--detach", "--name", EGRESS_GATEWAY_CONTAINER, "--env", `WORK_OS_EGRESS_TOKEN=${options.token}`];
  const container = await runDockerExpectingSuccess([...runArguments, "--publish", `127.0.0.1:${options.controlPort}:${EGRESS_CONTROL_PORT}`, options.image]);
  if (container instanceof WorkOsError) return container;

  const connected = await runDockerExpectingSuccess(["network", "connect", EGRESS_NETWORK, EGRESS_GATEWAY_CONTAINER]);
  if (connected instanceof WorkOsError) return connected;
  return waitUntilHealthy(gateway);
};

const ensureNetwork = async (): Promise<WorkOsError | undefined> => {
  const existing = await runDockerExpectingSuccess(["network", "inspect", EGRESS_NETWORK]);
  if (!(existing instanceof WorkOsError)) return undefined;

  const created = await runDockerExpectingSuccess(["network", "create", "--internal", EGRESS_NETWORK]);
  return created instanceof WorkOsError ? created : undefined;
};
