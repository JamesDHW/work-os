import { err, FileError, ok, type FileErrorCode, type Result } from "@earendil-works/pi-durable/env";
import type { RunId } from "@work-os/domain/identifiers/Identifiers";
import type { ExecInRunInput, RunToolHandlers } from "@work-os/core/runs/RunToolHandlers";
import { WorkOsError } from "@work-os/shared/WorkOsError";

import { EXIT_IS_DIRECTORY, EXIT_NOT_DIRECTORY, EXIT_NOT_FOUND, FILE_OPERATION_TIMEOUT_SECONDS } from "../harness.constants.ts";

export type FileCommand = {
  readonly path: string;
  readonly command: string;
  readonly stdin?: string;
};

export type FileCommandRunner = (fileCommand: FileCommand) => Promise<Result<string, FileError>>;

export const createFileCommandRunner = (runId: RunId, execInRun: RunToolHandlers["execInRun"]): FileCommandRunner => {
  return async (fileCommand) => {
    const request: ExecInRunInput = { runId, command: fileCommand.command, timeoutSeconds: FILE_OPERATION_TIMEOUT_SECONDS };
    const outcome = await execInRun(fileCommand.stdin === undefined ? request : { ...request, stdin: fileCommand.stdin });
    if (outcome instanceof WorkOsError) return err(new FileError("unknown", outcome.message, fileCommand.path, outcome));
    if (outcome.exitCode === 0) return ok(outcome.output);

    const code = errorCodeFor(outcome.exitCode);
    return err(new FileError(code, `${code}: ${fileCommand.path} ${outcome.output.trim()}`.trim(), fileCommand.path));
  };
};

const errorCodeFor = (exitCode: number): FileErrorCode => {
  switch (exitCode) {
    case EXIT_NOT_FOUND:
      return "not_found";
    case EXIT_IS_DIRECTORY:
      return "is_directory";
    case EXIT_NOT_DIRECTORY:
      return "not_directory";
    default:
      return "unknown";
  }
};
