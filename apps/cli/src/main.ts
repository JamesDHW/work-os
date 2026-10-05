import { DEFAULT_SERVER_PORT } from "@work-os/config/config.constants";
import { parseRunnerConfig } from "@work-os/config/RunnerConfig";
import { WorkOsError } from "@work-os/shared/WorkOsError";
import { homedir } from "os";
import { resolve } from "path";
import process from "process";

import { USAGE } from "./cli.constants.ts";
import { runDoctor } from "./doctor/runDoctor.ts";
import { pairRunner } from "./pairRunner.ts";
import { parseCommandLine, type CommandLine } from "./parseCommandLine.ts";
import { describeServices } from "./services/describeServices.ts";
import { installServices } from "./services/installServices.ts";
import { writeLine } from "./writeLine.ts";

const repositoryRoot = resolve(import.meta.dirname, "..", "..", "..");

const fail = (message: string): undefined => {
  process.stderr.write(`${message}\n`);
  process.exitCode = 1;
  return undefined;
};

const doctor = async (commandLine: CommandLine): Promise<undefined> => {
  const runnerConfig = parseRunnerConfig({ environment: process.env, homeDirectory: homedir() });
  if (runnerConfig instanceof WorkOsError) return fail(runnerConfig.message);

  const serverUrl = commandLine.serverUrl ?? `http://localhost:${DEFAULT_SERVER_PORT}`;
  const isHealthy = await runDoctor({ nodeVersion: process.versions.node, serverUrl, runnerDataDirectory: runnerConfig.dataDirectory });
  if (!isHealthy) return fail("Some checks failed.");
  return undefined;
};

const pair = async (commandLine: CommandLine): Promise<undefined> => {
  const [serverUrl, code] = commandLine.positionals;
  const hasArguments = serverUrl !== undefined && code !== undefined;
  if (!hasArguments) return fail("Usage: work-os pair <server URL> <code>");

  const exitCode = await pairRunner({ nodePath: process.execPath, repositoryRoot, serverUrl, code });
  if (exitCode instanceof WorkOsError) return fail(exitCode.message);
  if (exitCode !== 0) return fail("Pairing failed.");
  writeLine("Paired. Start the runner with: work-os install --runner-only, or node apps/runner/src/main.ts");
  return undefined;
};

const install = async (commandLine: CommandLine): Promise<undefined> => {
  const isBothExcluded = commandLine.isServerOnly && commandLine.isRunnerOnly;
  if (isBothExcluded) return fail("Choose --server-only or --runner-only, not both.");

  const names = [...(commandLine.isRunnerOnly ? [] : ["server" as const]), ...(commandLine.isServerOnly ? [] : ["runner" as const])];
  const services = describeServices({ nodePath: process.execPath, repositoryRoot, homeDirectory: homedir(), names });
  const installed = await installServices({ platform: process.platform, homeDirectory: homedir(), services });
  if (installed instanceof WorkOsError) return fail(installed.message);
  return undefined;
};

const start = async (): Promise<undefined> => {
  const commandLine = parseCommandLine(process.argv.slice(2));
  if (commandLine instanceof WorkOsError) return fail(`${commandLine.message}\n${USAGE}`);

  switch (commandLine.command) {
    case "doctor":
      return doctor(commandLine);
    case "pair":
      return pair(commandLine);
    case "install":
      return install(commandLine);
    case undefined:
    default:
      writeLine(USAGE);
      return undefined;
  }
};

void start();
