import type { Run } from "@work-os/domain/runs/Run";
import { WorkOsError } from "@work-os/shared/WorkOsError";

import type { OpenInboxItem } from "../inbox/openInboxItem.ts";
import type { ObservationStore } from "../observations/ObservationStore.ts";
import type { RecordObservation } from "../observations/recordObservation.ts";
import type { CheckFailure } from "./runChecks.ts";
import { CHECK_ATTEMPT_LIMIT } from "./runs.constants.ts";
import type { CompletionResult } from "./RunToolHandlers.ts";
import type { StopRunEnvironment } from "./stopRunEnvironment.ts";
import type { TransitionRun } from "./transitionRun.ts";

type HandleCheckFailuresDependencies = {
  readonly observationStore: Pick<ObservationStore, "countObservations">;
  readonly recordObservation: RecordObservation;
  readonly transitionRun: TransitionRun;
  readonly openInboxItem: OpenInboxItem;
  readonly stopRunEnvironment: StopRunEnvironment;
};

export type HandleCheckFailures = (run: Run, failures: readonly CheckFailure[]) => Promise<CompletionResult | WorkOsError>;

export const createHandleCheckFailures = (dependencies: HandleCheckFailuresDependencies): HandleCheckFailures => {
  return async (run, failures) => {
    const failedNames = failures.map((failure) => failure.name);
    await dependencies.recordObservation({ workspaceId: run.workspaceId, runId: run.id, kind: "checkFailed", detail: { checks: failedNames } });

    const attempts = await dependencies.observationStore.countObservations(run.id, "checkFailed");
    if (attempts instanceof WorkOsError) return attempts;
    if (attempts >= CHECK_ATTEMPT_LIMIT) return escalate(dependencies, run, attempts);

    const running = await dependencies.transitionRun({ run, event: { kind: "checksFailed" } });
    if (running instanceof WorkOsError) return running;

    return { message: describeFailures(failures), isFinished: false };
  };
};

const escalate = async (
  dependencies: HandleCheckFailuresDependencies,
  run: Run,
  attempts: number,
): Promise<CompletionResult | WorkOsError> => {
  const reason = `Checks failed ${attempts} times. The run stopped so a person can look.`;
  const failed = await dependencies.transitionRun({ run, event: { kind: "failed", message: reason } });
  if (failed instanceof WorkOsError) return failed;

  await dependencies.stopRunEnvironment(failed);
  const escalation = await dependencies.openInboxItem({
    workspaceId: run.workspaceId,
    runId: run.id,
    origin: { kind: "runReview" },
    title: `Checks keep failing on "${run.spec.prompt.slice(0, 80)}"`,
    isBlocking: false,
    payload: { kind: "escalation", reason },
  });
  if (escalation instanceof WorkOsError) return escalation;

  return { message: reason, isFinished: true };
};

const describeFailures = (failures: readonly CheckFailure[]): string => {
  const sections = failures.map((failure) => `## ${failure.name} (exit ${failure.exitCode})\n${failure.output}`);
  return `Checks failed. Fix the problems, then call complete again.\n\n${sections.join("\n\n")}`;
};
