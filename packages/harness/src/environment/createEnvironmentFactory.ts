import type { ExecutionEnv } from "@earendil-works/pi-durable/env";
import type { Context } from "@earendil-works/chord";
import type { EnvTarget } from "@earendil-works/pi-durable";
import type { RunToolHandlers } from "@work-os/core/runs/RunToolHandlers";

import { readRunId } from "../runs/readRunId.ts";
import { createRunnerFileSystem } from "./createRunnerFileSystem.ts";
import { createRunnerShell } from "./createRunnerShell.ts";
import { createFileCommandRunner } from "./runFileCommand.ts";

export type EnvironmentFactory = (target: EnvTarget, context: Context) => Promise<ExecutionEnv | undefined>;

export const createEnvironmentFactory = (execInRun: RunToolHandlers["execInRun"]): EnvironmentFactory => {
  return async (target, context) => {
    const runId = await readRunId(target.read, target.conversationId, context);
    if (runId === null) return undefined;

    const cwd = target.cwd ?? "/";
    const fileSystem = createRunnerFileSystem({ id: `run:${runId}`, cwd, runFileCommand: createFileCommandRunner(runId, execInRun) });
    const shell = createRunnerShell({ runId, cwd, execInRun });
    return { ...fileSystem, ...shell, cleanup: async (cleanupContext) => fileSystem.cleanup(cleanupContext) };
  };
};
