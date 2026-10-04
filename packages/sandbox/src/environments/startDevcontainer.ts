import { tryCatch } from "@work-os/shared/tryCatch";
import { WorkOsError } from "@work-os/shared/WorkOsError";

import { runProcess } from "../process/runProcess.ts";
import { DEVCONTAINER_UP_TIMEOUT_SECONDS, RUN_LABEL } from "../sandbox.constants.ts";

export type DevcontainerStart = {
  readonly devcontainerCommand: string;
  readonly projectPath: string;
  readonly configPath: string;
  readonly runId: string;
};

export class DevcontainerStartError extends WorkOsError {}

export const startDevcontainer = async (start: DevcontainerStart): Promise<string | WorkOsError> => {
  const outcome = await runProcess({
    command: start.devcontainerCommand,
    arguments: [
      "up",
      "--workspace-folder",
      start.projectPath,
      "--override-config",
      start.configPath,
      "--id-label",
      `${RUN_LABEL}=${start.runId}`,
      "--log-format",
      "json",
    ],
    timeoutSeconds: DEVCONTAINER_UP_TIMEOUT_SECONDS,
  });
  if (outcome instanceof WorkOsError) return outcome;

  const containerId = findContainerId(outcome.output);
  const hasStarted = outcome.exitCode === 0 && containerId !== undefined;
  if (!hasStarted) {
    return new DevcontainerStartError(`The environment did not start:\n${outcome.output.slice(-4000)}`);
  }
  return containerId;
};

const findContainerId = (output: string): string | undefined => {
  const results = output.split("\n").flatMap(parseOutcomeLine);
  return results.find((result) => result.length > 0);
};

const parseOutcomeLine = (line: string): readonly string[] => {
  const parsed = tryCatch((): unknown => JSON.parse(line));
  return hasContainerId(parsed) ? [parsed.containerId] : [];
};

const hasContainerId = (value: unknown): value is { readonly containerId: string } => {
  const hasField = typeof value === "object" && value !== null && "containerId" in value;
  return hasField && typeof value.containerId === "string";
};
