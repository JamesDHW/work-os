import type { EgressController } from "@work-os/sandbox/egress/EgressController";
import { WorkOsError } from "@work-os/shared/WorkOsError";

import { EGRESS_POLL_MILLISECONDS } from "./runner.constants.ts";
import type { SendLinkMessage } from "./runLink.ts";

// Reports hosts the gateway blocked while a connection is open; returns the function that stops reporting.
export const startEgressReporting = (egressController: EgressController | null, send: SendLinkMessage): (() => void) => {
  if (egressController === null) return () => undefined;

  const interval = setInterval(() => {
    void reportBlocked(egressController, send);
  }, EGRESS_POLL_MILLISECONDS);
  return () => clearInterval(interval);
};

const reportBlocked = async (egressController: EgressController, send: SendLinkMessage): Promise<undefined> => {
  const blocked = await egressController.drainBlocked();
  if (blocked instanceof WorkOsError) return undefined;

  for (const request of blocked) {
    send({ type: "egressBlocked", runId: request.runId, host: request.host });
  }
  return undefined;
};
