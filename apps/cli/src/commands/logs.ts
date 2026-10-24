import { WorkOsError } from "@work-os/shared/WorkOsError";

import type { CliContext } from "../CliContext.ts";
import { LOG_TAIL_LINES } from "../cli.constants.ts";
import { runInTerminal } from "../runInTerminal.ts";
import { selectedServices } from "./serviceCommands.ts";

export const runLogs = async (context: CliContext): Promise<WorkOsError | undefined> => {
  const names = selectedServices(context);
  if (names instanceof WorkOsError) return names;

  const files = names.map((name) => (name === "server" ? context.paths.serverLogFile : context.paths.runnerLogFile));
  const followFlag = context.commandLine.isFollowing ? ["-f"] : [];
  const exitCode = await runInTerminal({ command: "tail", arguments: ["-n", String(LOG_TAIL_LINES), ...followFlag, ...files] });
  if (exitCode instanceof WorkOsError) return exitCode;
  return undefined;
};
