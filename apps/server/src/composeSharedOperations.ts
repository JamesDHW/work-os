import { createFindConnectionSecret, type FindConnectionSecret } from "@work-os/core/connections/findConnectionSecret";
import { createOpenInboxItem, type OpenInboxItem } from "@work-os/core/inbox/openInboxItem";
import { createWithdrawRunItems, type WithdrawRunItems } from "@work-os/core/inbox/withdrawRunItems";
import { createNotifyBlockingItem } from "@work-os/core/notifications/notifyBlockingItem";
import { createRecordObservation, type RecordObservation } from "@work-os/core/observations/recordObservation";
import { createAwaitRunDecision, type AwaitRunDecision } from "@work-os/core/runs/awaitRunDecision";
import { createStopRunEnvironment, type StopRunEnvironment } from "@work-os/core/runs/stopRunEnvironment";
import { createTransitionRun, type TransitionRun } from "@work-os/core/runs/transitionRun";

import type { ServerContext } from "./ServerContext.ts";

export type SharedOperations = {
  readonly recordObservation: RecordObservation;
  readonly openInboxItem: OpenInboxItem;
  readonly withdrawRunItems: WithdrawRunItems;
  readonly transitionRun: TransitionRun;
  readonly awaitRunDecision: AwaitRunDecision;
  readonly stopRunEnvironment: StopRunEnvironment;
  readonly findConnectionSecret: FindConnectionSecret;
};

export const composeSharedOperations = (context: ServerContext): SharedOperations => {
  const { stores, clock, randomSource, logger, eventBus, inboxWaiters } = context;
  const notifyBlockingItem = createNotifyBlockingItem({ ...stores, pushSender: context.pushSender, logger });
  const openInboxItem = createOpenInboxItem({ inboxStore: stores.inboxStore, eventBus, notifyBlockingItem, randomSource, clock });
  const transitionRun = createTransitionRun({ runStore: stores.runStore, eventBus, clock });

  return {
    recordObservation: createRecordObservation({ observationStore: stores.observationStore, randomSource, clock, logger }),
    openInboxItem,
    withdrawRunItems: createWithdrawRunItems({ inboxStore: stores.inboxStore, inboxWaiters, eventBus }),
    transitionRun,
    awaitRunDecision: createAwaitRunDecision({ ...stores, inboxWaiters, openInboxItem, transitionRun }),
    stopRunEnvironment: createStopRunEnvironment({ runnerGateway: context.runnerHub, logger }),
    findConnectionSecret: createFindConnectionSecret({ connectionStore: stores.connectionStore, secretVault: context.secretVault }),
  };
};
