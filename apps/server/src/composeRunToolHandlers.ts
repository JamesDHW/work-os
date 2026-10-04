import { createCallCapability } from "@work-os/core/capabilities/callCapability";
import { createExecuteCapability } from "@work-os/core/capabilities/executeCapability";
import { createRecordGrant } from "@work-os/core/capabilities/recordGrant";
import { createSeekCapabilityApproval } from "@work-os/core/capabilities/seekCapabilityApproval";
import { createAskUser } from "@work-os/core/runs/askUser";
import { createCompleteRun } from "@work-os/core/runs/completeRun";
import { createExecInRun } from "@work-os/core/runs/execInRun";
import { createFinishCheckedRun } from "@work-os/core/runs/finishCheckedRun";
import { createHandleCheckFailures } from "@work-os/core/runs/handleCheckFailures";
import { createHandleTurnSettled } from "@work-os/core/runs/handleTurnSettled";
import { createLoadSkill } from "@work-os/core/runs/loadSkill";
import { createReportRunActivity } from "@work-os/core/runs/reportRunActivity";
import { createRunChecks } from "@work-os/core/runs/runChecks";
import type { RunToolHandlers } from "@work-os/core/runs/RunToolHandlers";

import type { SharedOperations } from "./composeSharedOperations.ts";
import type { ServerContext } from "./ServerContext.ts";

export const composeRunToolHandlers = (context: ServerContext, shared: SharedOperations): RunToolHandlers => {
  const { stores, clock, randomSource, logger, eventBus } = context;
  const runnerGateway = context.runnerHub;
  const executeCapability = createExecuteCapability({ ...stores, ...shared, runnerGateway, clock });
  const recordGrant = createRecordGrant({ grantStore: stores.grantStore, randomSource, clock });
  const seekCapabilityApproval = createSeekCapabilityApproval({ ...shared, recordGrant });

  return {
    askUser: createAskUser({ runStore: stores.runStore, ...shared }),
    callCapability: createCallCapability({ ...stores, ...shared, capabilityRegistry: context.capabilityRegistry, seekCapabilityApproval, executeCapability }),
    completeRun: createCompleteRun({
      runStore: stores.runStore,
      transitionRun: shared.transitionRun,
      runChecks: createRunChecks({ runnerGateway }),
      handleCheckFailures: createHandleCheckFailures({ ...stores, ...shared }),
      finishCheckedRun: createFinishCheckedRun({ ...shared, runnerGateway, logger }),
    }),
    execInRun: createExecInRun({ runStore: stores.runStore, runnerGateway }),
    loadSkill: createLoadSkill({ runStore: stores.runStore, workspacePackages: context.workspacePackages }),
    handleTurnSettled: createHandleTurnSettled({ runStore: stores.runStore, ...shared }),
    reportRunActivity: createReportRunActivity({ runStore: stores.runStore, eventBus }),
  };
};
