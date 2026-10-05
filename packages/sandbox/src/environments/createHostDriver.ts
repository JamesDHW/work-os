import { NotFoundError } from "@work-os/shared/NotFoundError";
import { WorkOsError } from "@work-os/shared/WorkOsError";

import type { ManifestStore } from "../outputs/createManifestStore.ts";
import { runProcess } from "../process/runProcess.ts";
import type { EnvironmentDriver } from "./EnvironmentDriver.ts";

// Runs commands directly in the project folder. The folder for each run comes from the run's record on disk,
// which prepareProject writes before the driver is asked to prepare.
export const createHostDriver = (manifestStore: Pick<ManifestStore, "readProjectPath">): EnvironmentDriver => ({
  prepare: async (input) => input.projectPath,
  exec: async (input) => {
    const projectPath = await manifestStore.readProjectPath(input.runId);
    if (projectPath instanceof WorkOsError) return new NotFoundError(`Run ${input.runId} has no environment on this machine. Restart the run.`, { cause: projectPath });

    return runProcess({ ...input, command: "bash", arguments: ["-c", input.command], cwd: input.cwd ?? projectPath });
  },
  stop: async () => undefined,
});
