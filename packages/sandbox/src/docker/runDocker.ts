import type { CommandOutcome } from "@work-os/domain/runners/RunnerResult";
import { WorkOsError } from "@work-os/shared/WorkOsError";

import { runProcess } from "../process/runProcess.ts";
import { DOCKER_COMMAND_TIMEOUT_SECONDS } from "../sandbox.constants.ts";

export class DockerCommandError extends WorkOsError {}

export const runDocker = async (dockerArguments: readonly string[]): Promise<CommandOutcome | WorkOsError> => {
  return runProcess({ command: "docker", arguments: dockerArguments, timeoutSeconds: DOCKER_COMMAND_TIMEOUT_SECONDS });
};

export const runDockerExpectingSuccess = async (dockerArguments: readonly string[]): Promise<string | WorkOsError> => {
  const outcome = await runDocker(dockerArguments);
  if (outcome instanceof WorkOsError) return outcome;
  if (outcome.exitCode !== 0) return new DockerCommandError(`docker ${dockerArguments[0] ?? ""} failed: ${outcome.output.trim()}`);

  return outcome.output.trim();
};
