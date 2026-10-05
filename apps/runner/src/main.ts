import { parseRunnerConfig } from "@work-os/config/RunnerConfig";
import { WorkOsError } from "@work-os/shared/WorkOsError";
import process from "process";

import { createRunnerSandbox } from "./createRunnerSandbox.ts";
import { pairWithServer } from "./pairWithServer.ts";
import { readRunnerCredentials, writeRunnerCredentials } from "./runnerCredentialsFile.ts";
import { startEgressReporting } from "./startEgressReporting.ts";
import { runLink } from "./runLink.ts";
import { toRunnerPlatform } from "./toRunnerPlatform.ts";
import { writeLogLine } from "./writeLogLine.ts";

const fail = (message: string): undefined => {
  writeLogLine("error", message);
  process.exitCode = 1;
  return undefined;
};

const pair = async (dataDirectory: string, serverUrl: string, code: string): Promise<undefined> => {
  const name = process.env["WORK_OS_RUNNER_NAME"] ?? (process.env["HOSTNAME"] ?? "this machine");
  const credentials = await pairWithServer({ serverUrl, code, name, platform: toRunnerPlatform(process.platform) });
  if (credentials instanceof WorkOsError) return fail(credentials.message);

  const written = await writeRunnerCredentials(dataDirectory, credentials);
  if (written instanceof WorkOsError) return fail(written.message);
  writeLogLine("info", "Paired with the work-os server.", { runnerId: credentials.runnerId });
  return undefined;
};

const pairFromArguments = async (dataDirectory: string, serverUrl: string | undefined, code: string | undefined): Promise<undefined> => {
  const hasArguments = serverUrl !== undefined && code !== undefined;
  if (!hasArguments) return fail("Usage: work-os-runner pair <server URL> <code>");

  return pair(dataDirectory, serverUrl, code);
};

const start = async (): Promise<undefined> => {
  const config = parseRunnerConfig({ environment: process.env, homeDirectory: process.env["HOME"] ?? "." });
  if (config instanceof WorkOsError) return fail(config.message);

  const [command, serverUrl, code] = process.argv.slice(2);
  if (command === "pair") return pairFromArguments(config.dataDirectory, serverUrl, code);

  const credentials = await readRunnerCredentials(config.dataDirectory);
  if (credentials instanceof WorkOsError) return fail(credentials.message);

  const { sandbox, egressController } = createRunnerSandbox(config);
  runLink({
    credentials,
    sandbox,
    onUnauthorized: () => fail("The server rejected this machine's token. Pair it again."),
    whileConnected: (send) => startEgressReporting(egressController, send),
  });
  writeLogLine("info", "work-os runner started.", { driver: config.environmentDriver });
  return undefined;
};

void start();
