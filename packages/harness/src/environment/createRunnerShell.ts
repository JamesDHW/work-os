import type { Context } from "@earendil-works/chord";
import { err, ExecutionError, ok, type Shell, type ShellExecOptions } from "@earendil-works/pi-durable/env";
import type { RunToolHandlers } from "@work-os/core/runs/RunToolHandlers";
import type { RunId } from "@work-os/domain/identifiers/Identifiers";
import { WorkOsError } from "@work-os/shared/WorkOsError";

import { DEFAULT_EXEC_TIMEOUT_SECONDS } from "../harness.constants.ts";
import { shellQuote } from "./shellQuote.ts";

export type RunnerShellOptions = {
  readonly runId: RunId;
  readonly cwd: string;
  readonly execInRun: RunToolHandlers["execInRun"];
};

export const createRunnerShell = (options: RunnerShellOptions): Shell => ({
  exec: async (command: string, execOptions: ShellExecOptions | undefined, context: Context) => {
    const outcome = await options.execInRun({
      runId: options.runId,
      command: `${exportVariables(execOptions?.env ?? {})}${command}`,
      cwd: execOptions?.cwd ?? options.cwd,
      timeoutSeconds: execOptions?.timeout ?? DEFAULT_EXEC_TIMEOUT_SECONDS,
      onOutput: (chunk) => execOptions?.onOutput?.(chunk, context),
    });
    if (outcome instanceof WorkOsError) return err(new ExecutionError("unknown", outcome.message, outcome));
    if (outcome.isTimedOut) return err(new ExecutionError("timeout", "The command timed out."));

    return ok({ exitCode: outcome.exitCode });
  },
  cleanup: async () => undefined,
});

const exportVariables = (variables: Readonly<Record<string, string>>): string => {
  return Object.entries(variables)
    .map(([name, value]) => `export ${name}=${shellQuote(value)}; `)
    .join("");
};
