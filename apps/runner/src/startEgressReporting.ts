import type { EgressController } from "@work-os/sandbox/egress/EgressController";
import { WorkOsError } from "@work-os/shared/WorkOsError";

import { EGRESS_POLL_MILLISECONDS } from "./runner.constants.ts";
import type { Link } from "./runLink.ts";

export const startEgressReporting = (egressController: EgressController | null, link: Link): void => {
  if (egressController === null) return;

  setInterval(() => {
    void reportBlocked(egressController, link);
  }, EGRESS_POLL_MILLISECONDS);
};

const reportBlocked = async (egressController: EgressController, link: Link): Promise<undefined> => {
  const blocked = await egressController.drainBlocked();
  if (blocked instanceof WorkOsError) return undefined;

  for (const request of blocked) {
    link.send({ type: "egressBlocked", runId: request.runId, host: request.host });
  }
  return undefined;
};
