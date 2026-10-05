import type { RunId } from "@work-os/domain/identifiers/Identifiers";
import { tryCatchAsync } from "@work-os/shared/tryCatch";
import { WorkOsError } from "@work-os/shared/WorkOsError";
import { mkdir, writeFile } from "fs/promises";
import { join } from "path";

import { findRunContainer } from "../docker/findRunContainer.ts";
import { runDockerExpectingSuccess } from "../docker/runDocker.ts";
import type { EgressController } from "../egress/EgressController.ts";
import { runProcess } from "../process/runProcess.ts";
import { WORKSPACE_MOUNT_PATH } from "../sandbox.constants.ts";
import { composeEffectiveDevcontainer } from "./composeEffectiveDevcontainer.ts";
import type { EnvironmentDriver, PrepareEnvironmentInput } from "./EnvironmentDriver.ts";
import { startDevcontainer } from "./startDevcontainer.ts";

export type DockerDriverOptions = {
  readonly runsDirectory: string;
  readonly devcontainerCommand: string;
  readonly egressController: EgressController;
};

// Each run's container is found by its work-os.run label on every call, so a runner restart loses nothing.
export const createDockerDriver = (options: DockerDriverOptions): EnvironmentDriver => {
  return {
    prepare: async (input) => {
      const containerId = await prepareContainer(options, input);
      if (containerId instanceof WorkOsError) return containerId;

      return WORKSPACE_MOUNT_PATH;
    },
    exec: async (input) => {
      const containerId = await findRunContainer(input.runId);
      if (containerId instanceof WorkOsError) return containerId;

      const dockerArguments = ["exec", "--interactive", "--workdir", input.cwd ?? WORKSPACE_MOUNT_PATH, containerId, "bash", "-c", input.command];
      return runProcess({ command: "docker", arguments: dockerArguments, timeoutSeconds: input.timeoutSeconds, onOutput: input.onOutput, stdin: input.stdin });
    },
    stop: async (runId) => {
      const containerId = await findRunContainer(runId);
      if (containerId instanceof WorkOsError) return undefined;

      await options.egressController.revoke(containerId);
      const removed = await runDockerExpectingSuccess(["rm", "--force", containerId]);
      return removed instanceof WorkOsError ? removed : undefined;
    },
  };
};

const prepareContainer = async (options: DockerDriverOptions, input: PrepareEnvironmentInput): Promise<string | WorkOsError> => {
  const ready = await options.egressController.ensureReady();
  if (ready instanceof WorkOsError) return ready;

  const configPath = await writeEffectiveConfig(options.runsDirectory, input);
  if (configPath instanceof WorkOsError) return configPath;

  const containerId = await startDevcontainer({ devcontainerCommand: options.devcontainerCommand, projectPath: input.projectPath, configPath, runId: input.runId });
  if (containerId instanceof WorkOsError) return containerId;

  const allowed = await options.egressController.allow({ runId: input.runId, containerId, hosts: input.egress });
  if (allowed instanceof WorkOsError) return allowed;
  return containerId;
};

const writeEffectiveConfig = async (runsDirectory: string, input: PrepareEnvironmentInput): Promise<string | WorkOsError> => {
  const runDirectory = join(runsDirectory, input.runId);
  const configPath = join(runDirectory, "devcontainer.json");
  const effective = composeEffectiveDevcontainer({ devcontainer: input.devcontainer, projectPath: input.projectPath, runId: input.runId });
  const written = await tryCatchAsync(async () => {
    await mkdir(runDirectory, { recursive: true });
    await writeFile(configPath, JSON.stringify(effective, null, 2));
  });
  return written instanceof WorkOsError ? written : configPath;
};
