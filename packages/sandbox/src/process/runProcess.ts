import type { CommandOutcome } from "@work-os/domain/runners/RunnerResult";
import { tryCatch } from "@work-os/shared/tryCatch";
import { WorkOsError } from "@work-os/shared/WorkOsError";
import { spawn } from "child_process";

import { KILL_GRACE_MILLISECONDS, MAX_OUTPUT_BYTES, MILLISECONDS_PER_SECOND } from "../sandbox.constants.ts";
import { createOutputBuffer } from "./outputBuffer.state.ts";

export type ProcessRequest = {
  readonly command: string;
  readonly arguments: readonly string[];
  readonly cwd?: string;
  readonly environment?: Readonly<Record<string, string>>;
  readonly stdin?: string | undefined;
  readonly timeoutSeconds: number;
  readonly onOutput?: (chunk: string) => void;
};

export class ProcessStartError extends WorkOsError {}

export const runProcess = async (request: ProcessRequest): Promise<CommandOutcome | WorkOsError> => {
  const environment = { ...process.env, ...request.environment };
  const timeout = AbortSignal.timeout(request.timeoutSeconds * MILLISECONDS_PER_SECOND);
  const child = tryCatch(() => spawn(request.command, [...request.arguments], { cwd: request.cwd, env: environment, stdio: "pipe", signal: timeout, killSignal: "SIGTERM" }));
  if (child instanceof WorkOsError) return new ProcessStartError(`Could not start ${request.command}.`, { cause: child });

  const output = createOutputBuffer(MAX_OUTPUT_BYTES);
  const completion = Promise.withResolvers<CommandOutcome | WorkOsError>();
  // The signal ends the process with SIGTERM when time runs out; SIGKILL follows if it ignores that.
  timeout.addEventListener("abort", () => setTimeout(() => child.kill("SIGKILL"), KILL_GRACE_MILLISECONDS).unref(), { once: true });
  const collect = (chunk: Buffer): void => {
    const text = chunk.toString("utf8");
    output.append(text);
    request.onOutput?.(text);
  };
  child.stdout.on("data", collect);
  child.stderr.on("data", collect);
  child.on("error", (error) => {
    // A timeout surfaces as an AbortError before close; close reports it as isTimedOut.
    if (timeout.aborted) return;
    completion.resolve(new ProcessStartError(`${request.command} failed: ${error.message}`, { cause: error }));
  });
  child.on("close", (exitCode) => completion.resolve({ exitCode: exitCode ?? -1, output: output.text(), isTimedOut: timeout.aborted }));
  child.stdin.end(request.stdin ?? "");
  return completion.promise;
};
