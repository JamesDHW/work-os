import type { CommandOutcome } from "@work-os/domain/runners/RunnerResult";
import { tryCatch } from "@work-os/shared/tryCatch";
import { WorkOsError } from "@work-os/shared/WorkOsError";
import { spawn } from "child_process";

import { KILL_GRACE_MILLISECONDS, MAX_OUTPUT_BYTES, MILLISECONDS_PER_SECOND } from "../sandbox.constants.ts";
import { createOutputBuffer } from "./createOutputBuffer.ts";

export type ProcessRequest = {
  readonly command: string;
  readonly arguments: readonly string[];
  readonly cwd?: string;
  readonly environment?: Readonly<Record<string, string>>;
  readonly stdin?: string;
  readonly timeoutSeconds: number;
  readonly onOutput?: (chunk: string) => void;
};

export class ProcessStartError extends WorkOsError {}

export const runProcess = async (request: ProcessRequest): Promise<CommandOutcome | WorkOsError> => {
  const environment = { ...process.env, ...request.environment };
  const child = tryCatch(() => spawn(request.command, [...request.arguments], { cwd: request.cwd, env: environment, stdio: "pipe" }));
  if (child instanceof WorkOsError) return new ProcessStartError(`Could not start ${request.command}.`, { cause: child });

  const output = createOutputBuffer(MAX_OUTPUT_BYTES);
  const completion = Promise.withResolvers<CommandOutcome | WorkOsError>();
  const timeout = createTimeout(() => child.kill("SIGTERM"), () => child.kill("SIGKILL"), request.timeoutSeconds);
  const collect = (chunk: Buffer): void => {
    const text = chunk.toString("utf8");
    output.append(text);
    request.onOutput?.(text);
  };
  child.stdout.on("data", collect);
  child.stderr.on("data", collect);
  child.on("error", (error) => completion.resolve(new ProcessStartError(`${request.command} failed: ${error.message}`, { cause: error })));
  child.on("close", (exitCode) => {
    timeout.clear();
    completion.resolve({ exitCode: exitCode ?? -1, output: output.text(), isTimedOut: timeout.hasFired() });
  });
  child.stdin.end(request.stdin ?? "");
  return completion.promise;
};

const createTimeout = (terminate: () => void, kill: () => void, timeoutSeconds: number) => {
  const firings: string[] = [];
  const timer = setTimeout(() => {
    firings.push("terminate");
    terminate();
    setTimeout(kill, KILL_GRACE_MILLISECONDS).unref();
  }, timeoutSeconds * MILLISECONDS_PER_SECOND);
  return {
    clear: () => clearTimeout(timer),
    hasFired: () => firings.length > 0,
  };
};
