import type { RunId } from "@work-os/domain/identifiers/Identifiers";
import type { JsonObject } from "@work-os/domain/json/Json";
import type { CommandOutcome } from "@work-os/domain/runners/RunnerResult";
import type { WorkOsError } from "@work-os/shared/WorkOsError";

export type PrepareEnvironmentInput = {
  readonly runId: RunId;
  readonly projectPath: string;
  readonly devcontainer: JsonObject;
  readonly egress: readonly string[];
};

export type ExecInput = {
  readonly runId: RunId;
  readonly command: string;
  readonly stdin?: string;
  readonly cwd?: string;
  readonly timeoutSeconds: number;
  readonly onOutput: (chunk: string) => void;
};

export type EnvironmentDriver = {
  readonly prepare: (input: PrepareEnvironmentInput) => Promise<string | WorkOsError>;
  readonly exec: (input: ExecInput) => Promise<CommandOutcome | WorkOsError>;
  readonly stop: (runId: RunId) => Promise<WorkOsError | undefined>;
};
