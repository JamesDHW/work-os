import { tryCatchAsync } from "@work-os/shared/tryCatch";
import { WorkOsError } from "@work-os/shared/WorkOsError";
import process from "process";

import type { CliContext } from "../../CliContext.ts";
import { SERVER_ENVIRONMENT_HEADER } from "../../cli.constants.ts";
import { updateEnvironmentFile } from "../../profile/environmentFile.ts";
import { readProfileSettings } from "../../profile/readProfileSettings.ts";
import { waitForServer } from "../../server/waitForServer.ts";
import { writeLine } from "../../writeLine.ts";
import { chooseDevDriver } from "./chooseDevDriver.ts";
import { composeDevEnvironment, type DevEnvironment } from "./devEnvironment.ts";
import { createDevProcesses, type DevProcesses } from "./devProcesses.state.ts";
import { devClient, openDevSession } from "./devSession.ts";
import { ensureDevMasterKey } from "./ensureDevMasterKey.ts";
import { ensureDevModels } from "./ensureDevModels.ts";
import { ensureDevRunnerPairing } from "./ensureDevRunner.ts";
import { startDevChildren, startDevRunner } from "./startDevChildren.ts";

// One terminal, everything running, already signed in: the server (restarting on source changes), Vite and a paired runner.
export const runDev = async (context: CliContext): Promise<WorkOsError | undefined> => {
  const initial = await readProfileSettings(context.paths);
  if (initial instanceof WorkOsError) return initial;

  const keyed = await ensureDevMasterKey({ context, serverSettings: initial.server });
  if (keyed instanceof WorkOsError) return keyed;

  const settings = await readProfileSettings(context.paths);
  if (settings instanceof WorkOsError) return settings;

  const driver = await chooseDevDriver(context);
  if (driver instanceof WorkOsError) return driver;

  const environment = composeDevEnvironment({ context, settings, driver });
  const remembered = await rememberDevAddress(context, environment);
  if (remembered instanceof WorkOsError) return remembered;

  const processes = createDevProcesses();
  const stopOnSignal = (): void => {
    writeLine("Stopping…");
    processes.stopAll();
  };
  process.once("SIGINT", stopOnSignal);
  process.once("SIGTERM", stopOnSignal);

  const started = startDevChildren({ context, environment, processes });
  if (started instanceof WorkOsError) return stopWith(processes, started);

  const prepared = await prepareDevAccount(context, environment, processes);
  if (prepared instanceof WorkOsError) return stopWith(processes, prepared);

  writeLine("");
  writeLine(`work-os dev is running: ${environment.webUrl} (signed in automatically, profile "${context.paths.profile}", runner driver ${driver}).`);
  writeLine("Server source changes restart the server; the web app hot-reloads. Press Ctrl-C to stop everything.");
  writeLine("");

  const exitCode = await started.anyExited;
  processes.stopAll();
  const isCleanExit = exitCode === 0 || exitCode === null;
  if (!isCleanExit) return new WorkOsError(`A dev process exited with code ${exitCode}.`);
  return undefined;
};

const prepareDevAccount = async (context: CliContext, environment: DevEnvironment, processes: DevProcesses): Promise<WorkOsError | undefined> => {
  const status = await waitForServer(environment.serverUrl);
  if (status instanceof WorkOsError) return new WorkOsError(`${status.message} The [server] lines above say why it did not start.`);

  const session = await openDevSession({ serverUrl: environment.serverUrl, isSetUp: status.isSetUp, setupCode: environment.setupCode });
  if (session instanceof WorkOsError) return session;

  const current = await tryCatchAsync(async () => devClient(session).GET("/api/session"));
  if (current instanceof WorkOsError) return current;

  const workspaceId = current.data?.workspaces[0]?.id;
  if (workspaceId === undefined) return new WorkOsError("The development account has no workspace.");

  const modelled = await ensureDevModels({ session, workspaceId });
  if (modelled instanceof WorkOsError) return modelled;
  if (context.commandLine.isRunnerSkipped) return undefined;

  const paired = await ensureDevRunnerPairing({ context, session, workspaceId });
  if (paired instanceof WorkOsError) return paired;

  const runner = startDevRunner({ context, environment, processes });
  return runner instanceof WorkOsError ? runner : undefined;
};

// Other commands (status, pair, sign-in-code) read the profile's settings file, so the ports dev chose are written there.
const rememberDevAddress = async (context: CliContext, environment: DevEnvironment): Promise<WorkOsError | undefined> =>
  updateEnvironmentFile(context.paths.serverEnvironmentFile, { WORK_OS_PORT: String(environment.port), WORK_OS_PUBLIC_ORIGIN: environment.webUrl }, SERVER_ENVIRONMENT_HEADER);

const stopWith = (processes: DevProcesses, failure: WorkOsError): WorkOsError => {
  processes.stopAll();
  return failure;
};
