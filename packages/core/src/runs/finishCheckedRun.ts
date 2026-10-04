import type { Run, RunOutputs } from "@work-os/domain/runs/Run";
import { WorkOsError } from "@work-os/shared/WorkOsError";

import type { OpenInboxItem } from "../inbox/openInboxItem.ts";
import type { RunnerGateway } from "../runners/RunnerGateway.ts";
import type { Logger } from "../system/Logger.ts";
import { REVIEW_SUMMARY_LIMIT } from "./runs.constants.ts";
import type { CompletionResult } from "./RunToolHandlers.ts";
import type { StopRunEnvironment } from "./stopRunEnvironment.ts";
import type { TransitionRun } from "./transitionRun.ts";

type FinishCheckedRunDependencies = {
  readonly runnerGateway: Pick<RunnerGateway, "request">;
  readonly transitionRun: TransitionRun;
  readonly openInboxItem: OpenInboxItem;
  readonly stopRunEnvironment: StopRunEnvironment;
  readonly logger: Logger;
};

export type FinishCheckedRun = (run: Run) => Promise<CompletionResult | WorkOsError>;

export const createFinishCheckedRun = (dependencies: FinishCheckedRunDependencies): FinishCheckedRun => {
  return async (run) => {
    const outputs = await collectOutputs(dependencies, run);
    const isReviewRequired = run.spec.standard.review !== "none";
    const checked = await dependencies.transitionRun({ run, event: { kind: "checksPassed", isReviewRequired }, change: { outputs } });
    if (checked instanceof WorkOsError) return checked;
    if (!isReviewRequired) return finishWithoutReview(dependencies, checked);

    const review = await dependencies.openInboxItem({
      workspaceId: checked.workspaceId,
      runId: checked.id,
      origin: { kind: "runReview" },
      title: `Review "${checked.spec.prompt.slice(0, 80)}"`,
      isBlocking: checked.spec.standard.review === "required",
      payload: { kind: "review", summary: (checked.summary ?? "").slice(0, REVIEW_SUMMARY_LIMIT), changedFileCount: outputs.changedFiles.length },
    });
    if (review instanceof WorkOsError) return review;

    return { message: "Checks passed. The work is waiting for review; stop here.", isFinished: true };
  };
};

const collectOutputs = async (dependencies: FinishCheckedRunDependencies, run: Run): Promise<RunOutputs> => {
  const collected = await dependencies.runnerGateway.request(run.spec.project.runnerId, { kind: "collectChanges", runId: run.id });
  if (collected instanceof WorkOsError) {
    dependencies.logger.warn("Could not collect changed files.", { runId: run.id, message: collected.message });
    return { changedFiles: [], diff: null };
  }
  return { changedFiles: collected.changedFiles, diff: collected.diff };
};

const finishWithoutReview = async (dependencies: FinishCheckedRunDependencies, run: Run): Promise<CompletionResult> => {
  await dependencies.stopRunEnvironment(run);
  return { message: "Checks passed. The run is complete; stop here.", isFinished: true };
};
