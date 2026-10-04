import type { RunId } from "@work-os/domain/identifiers/Identifiers";
import { NotFoundError } from "@work-os/shared/NotFoundError";

import { runProcess } from "../process/runProcess.ts";
import type { EnvironmentDriver } from "./EnvironmentDriver.ts";

export const createHostDriver = (): EnvironmentDriver => {
  const projectPaths = new Map<RunId, string>();

  return {
    prepare: async (input) => {
      projectPaths.set(input.runId, input.projectPath);
      return input.projectPath;
    },
    exec: async (input) => {
      const projectPath = projectPaths.get(input.runId);
      if (projectPath === undefined) return new NotFoundError(`Run ${input.runId} has no environment on this machine. Restart the run.`);

      return runProcess({ ...input, command: "bash", arguments: ["-c", input.command], cwd: input.cwd ?? projectPath });
    },
    stop: async (runId) => {
      projectPaths.delete(runId);
      return undefined;
    },
  };
};
