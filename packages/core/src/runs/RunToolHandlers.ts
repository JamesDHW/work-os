import type { RunId } from "@work-os/domain/identifiers/Identifiers";
import type { JsonObject } from "@work-os/domain/json/Json";
import type { CommandOutcome } from "@work-os/domain/runners/RunnerResult";
import type { CapabilityId } from "@work-os/domain/identifiers/Identifiers";
import type { WorkOsError } from "@work-os/shared/WorkOsError";

export type AskUserInput = {
  readonly runId: RunId;
  readonly taskId: string;
  readonly question: string;
  readonly options: readonly string[];
};

export type CallCapabilityInput = {
  readonly runId: RunId;
  readonly taskId: string;
  readonly capabilityId: CapabilityId;
  readonly target: string;
  readonly arguments: JsonObject;
};

export type CompleteRunInput = {
  readonly runId: RunId;
  readonly summary: string;
};

export type CompletionResult = {
  readonly message: string;
  readonly isFinished: boolean;
};

export type ExecInRunInput = {
  readonly runId: RunId;
  readonly command: string;
  readonly stdin?: string;
  readonly cwd?: string;
  readonly timeoutSeconds: number;
  readonly onOutput?: (chunk: string) => void;
};

export type TurnSettledInput = {
  readonly runId: RunId;
  readonly answerText: string;
};

export type RunToolHandlers = {
  readonly askUser: (input: AskUserInput) => Promise<string | WorkOsError>;
  readonly callCapability: (input: CallCapabilityInput) => Promise<string | WorkOsError>;
  readonly completeRun: (input: CompleteRunInput) => Promise<CompletionResult | WorkOsError>;
  readonly execInRun: (input: ExecInRunInput) => Promise<CommandOutcome | WorkOsError>;
  readonly handleTurnSettled: (input: TurnSettledInput) => Promise<WorkOsError | undefined>;
  readonly reportRunActivity: (runId: RunId) => Promise<undefined>;
};
