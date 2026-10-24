import { DEV_PROFILE } from "@work-os/config/config.constants";
import { WorkOsError } from "@work-os/shared/WorkOsError";
import { homedir } from "os";
import { dirname, resolve } from "path";
import process from "process";

import { resolveAppDirectory } from "./appDirectory.ts";
import type { CliContext } from "./CliContext.ts";
import { USAGE } from "./cli.constants.ts";
import { runDev } from "./commands/dev/runDev.ts";
import { runDoctorCommand } from "./commands/doctor.ts";
import { runLogs } from "./commands/logs.ts";
import { runPair } from "./commands/pair.ts";
import { runReset, runUninstall } from "./commands/reset.ts";
import { runServiceAction } from "./commands/serviceCommands.ts";
import { runSetup } from "./commands/setup.ts";
import { runSignInCode } from "./commands/signInCode.ts";
import { runStatus } from "./commands/status.ts";
import { runUpdate } from "./commands/update.ts";
import { parseCommandLine, type CommandLine } from "./parseCommandLine.ts";
import { resolveProfile } from "./profile/resolveProfile.ts";
import { resolveNodePath } from "./resolveNodePath.ts";
import { createServiceManager } from "./services/createServiceManager.ts";
import { writeLine } from "./writeLine.ts";

const sourceRoot = resolve(import.meta.dirname, "..", "..", "..");

const fail = (message: string): undefined => {
  process.stderr.write(`${message}\n`);
  process.exitCode = 1;
  return undefined;
};

const createContext = async (commandLine: CommandLine): Promise<CliContext | WorkOsError> => {
  const homeDirectory = homedir();
  const paths = resolveProfile({ flag: commandLine.profile, environment: process.env, homeDirectory, fallback: commandLine.command === "dev" ? DEV_PROFILE : undefined });
  if (paths instanceof WorkOsError) return paths;

  const services = createServiceManager({ platform: process.platform, homeDirectory, userId: process.getuid?.() });
  if (services instanceof WorkOsError) return services;

  const nodePath = await resolveNodePath();
  if (nodePath instanceof WorkOsError) return nodePath;

  const appDirectory = await resolveAppDirectory({ flag: commandLine.appDirectory, environment: process.env, sourceRoot, homeDirectory });
  const searchPath = `${dirname(nodePath)}:${process.env["PATH"] ?? "/usr/bin:/bin"}`;
  return { commandLine, paths, appDirectory, homeDirectory, nodePath, searchPath, platform: process.platform, userId: process.getuid?.(), environment: process.env, services };
};

const dispatch = async (context: CliContext): Promise<WorkOsError | undefined> => {
  switch (context.commandLine.command) {
    case "dev":
      return runDev(context);
    case "setup":
      return runSetup(context);
    case "start":
      return runServiceAction(context, "start");
    case "stop":
      return runServiceAction(context, "stop");
    case "restart":
      return runServiceAction(context, "restart");
    case "status":
      return runStatus(context);
    case "logs":
      return runLogs(context);
    case "doctor":
      return runDoctorCommand(context);
    case "pair":
      return runPair(context);
    case "sign-in-code":
      return runSignInCode(context);
    case "update":
      return runUpdate(context);
    case "reset":
      return runReset(context);
    case "uninstall":
      return runUninstall(context);
    case undefined:
    default:
      writeLine(USAGE);
      return undefined;
  }
};

const start = async (): Promise<undefined> => {
  const commandLine = parseCommandLine(process.argv.slice(2));
  if (commandLine instanceof WorkOsError) return fail(`${commandLine.message}\n${USAGE}`);

  const context = await createContext(commandLine);
  if (context instanceof WorkOsError) return fail(context.message);

  const outcome = await dispatch(context);
  return outcome instanceof WorkOsError ? fail(outcome.message) : undefined;
};

void start();
