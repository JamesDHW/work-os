import type { InboxAnswer } from "@work-os/domain/inbox/InboxAnswer";
import type { InboxItem } from "@work-os/domain/inbox/InboxItem";
import { WorkOsError } from "@work-os/shared/WorkOsError";

import type { RouteInboxAnswer } from "../inbox/answerInboxItem.ts";
import type { ApplyReviewAnswer } from "./applyReviewAnswer.ts";
import type { ReplyToWaitingRun } from "./replyToWaitingRun.ts";

type RouteRunInboxAnswerDependencies = {
  readonly replyToWaitingRun: ReplyToWaitingRun;
  readonly applyReviewAnswer: ApplyReviewAnswer;
};

export const createRouteRunInboxAnswer = (dependencies: RouteRunInboxAnswerDependencies): RouteInboxAnswer => {
  return async (inboxItem, answer) => {
    if (inboxItem.runId === null) return undefined;

    return routeByOrigin(dependencies, inboxItem, answer);
  };
};

const routeByOrigin = async (
  dependencies: RouteRunInboxAnswerDependencies,
  inboxItem: InboxItem,
  answer: InboxAnswer,
): Promise<WorkOsError | undefined> => {
  switch (inboxItem.origin.kind) {
    case "agentQuestion":
    case "capabilityApproval":
      return undefined;
    case "runInput":
      return dependencies.replyToWaitingRun(inboxItem, answer);
    case "runReview":
      return dependencies.applyReviewAnswer(inboxItem, answer);
    default:
      return inboxItem.origin satisfies never;
  }
};
