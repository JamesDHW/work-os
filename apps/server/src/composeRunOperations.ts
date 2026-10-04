import { createAnswerInboxItem, type AnswerInboxItem } from "@work-os/core/inbox/answerInboxItem";
import { createAddRunCapability, type AddRunCapability } from "@work-os/core/runs/addRunCapability";
import type { AgentRuntime } from "@work-os/core/runs/AgentRuntime";
import { createApplyReviewAnswer } from "@work-os/core/runs/applyReviewAnswer";
import { createComposeRunSpecForProject } from "@work-os/core/runs/composeRunSpecForProject";
import { createGetRunDetail, type GetRunDetail } from "@work-os/core/runs/getRunDetail";
import { createPrepareRun } from "@work-os/core/runs/prepareRun";
import { createReplyToWaitingRun } from "@work-os/core/runs/replyToWaitingRun";
import { createResumeActiveRuns, type ResumeActiveRuns } from "@work-os/core/runs/resumeActiveRuns";
import { createResumeWaitingRun } from "@work-os/core/runs/resumeWaitingRun";
import { createRouteRunInboxAnswer } from "@work-os/core/runs/routeRunInboxAnswer";
import { createSendRunMessage, type SendRunMessage } from "@work-os/core/runs/sendRunMessage";
import { createStartRun, type StartRun } from "@work-os/core/runs/startRun";
import { createStopRun, type StopRun } from "@work-os/core/runs/stopRun";

import type { SharedOperations } from "./composeSharedOperations.ts";
import type { ServerContext } from "./ServerContext.ts";

export type RunOperations = {
  readonly startRun: StartRun;
  readonly sendRunMessage: SendRunMessage;
  readonly stopRun: StopRun;
  readonly getRunDetail: GetRunDetail;
  readonly addRunCapability: AddRunCapability;
  readonly answerInboxItem: AnswerInboxItem;
  readonly resumeActiveRuns: ResumeActiveRuns;
};

export const composeRunOperations = (context: ServerContext, shared: SharedOperations, agentRuntime: AgentRuntime): RunOperations => {
  const { stores, clock, randomSource, logger, eventBus, inboxWaiters } = context;
  const runnerGateway = context.runnerHub;
  const prepareRun = createPrepareRun({ runnerGateway, agentRuntime, transitionRun: shared.transitionRun, logger });
  const composeRunSpecForProject = createComposeRunSpecForProject({ ...stores, workspacePackages: context.workspacePackages });
  const routeInboxAnswer = createRouteRunInboxAnswer({
    replyToWaitingRun: createReplyToWaitingRun({ ...stores, ...shared, agentRuntime }),
    applyReviewAnswer: createApplyReviewAnswer({ ...stores, ...shared, agentRuntime }),
  });
  const resumeWaitingRun = createResumeWaitingRun({ inboxStore: stores.inboxStore, inboxWaiters, eventBus, transitionRun: shared.transitionRun });

  return {
    startRun: createStartRun({ composeRunSpecForProject, runStore: stores.runStore, prepareRun, eventBus, randomSource, clock }),
    sendRunMessage: createSendRunMessage({ ...stores, ...shared, agentRuntime, resumeWaitingRun, prepareRun, randomSource }),
    stopRun: createStopRun({ ...stores, ...shared, agentRuntime }),
    getRunDetail: createGetRunDetail({ ...stores, agentRuntime }),
    addRunCapability: createAddRunCapability({ ...stores, capabilityRegistry: context.capabilityRegistry, agentRuntime, eventBus, randomSource, clock }),
    answerInboxItem: createAnswerInboxItem({ inboxStore: stores.inboxStore, inboxWaiters, eventBus, clock, routeInboxAnswer }),
    resumeActiveRuns: createResumeActiveRuns({ runStore: stores.runStore, agentRuntime, prepareRun, logger }),
  };
};
