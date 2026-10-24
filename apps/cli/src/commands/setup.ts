import { WorkOsError } from "@work-os/shared/WorkOsError";

import type { CliContext } from "../CliContext.ts";
import { SERVICE_NAMES } from "../cli.constants.ts";
import { readProfileSettings } from "../profile/readProfileSettings.ts";
import { checkRunnerPairing } from "../doctor/checkRunnerPairing.ts";
import { readSetupCode } from "../server/readSetupCode.ts";
import { waitForServer } from "../server/waitForServer.ts";
import { describeServices } from "../services/describeServices.ts";
import type { ServiceName } from "../services/ServiceDefinition.ts";
import { ensureGatewayImage } from "../setup/ensureGatewayImage.ts";
import { ensureWebBuild } from "../setup/ensureWebBuild.ts";
import { migrateLegacyLayout } from "../setup/migrateLegacyLayout.ts";
import { resolvePublicOrigin } from "../setup/resolvePublicOrigin.ts";
import { writeProfileSettings } from "../setup/writeProfileSettings.ts";
import { writeLine } from "../writeLine.ts";
import { pairLocalRunner } from "./pairLocalRunner.ts";
import { runRunnerPair } from "./runRunnerPair.ts";

// One idempotent command turns this machine into a working installation of a profile: build, settings, services, start.
export const runSetup = async (context: CliContext): Promise<WorkOsError | undefined> => {
  const { commandLine, paths } = context;
  const names = serviceNames(commandLine.role);

  const migrated = await migrateLegacyLayout({ homeDirectory: context.homeDirectory, platform: context.platform, userId: context.userId });
  if (migrated instanceof WorkOsError) return migrated;

  const prepared = await prepareApp(context, names);
  if (prepared instanceof WorkOsError) return prepared;

  const current = await readProfileSettings(paths);
  if (current instanceof WorkOsError) return current;

  const port = commandLine.port ?? current.port;
  const publicOrigin = await resolvePublicOrigin({ origin: commandLine.origin, exposure: commandLine.exposure, current: current.server["WORK_OS_PUBLIC_ORIGIN"], port });
  if (publicOrigin instanceof WorkOsError) return publicOrigin;

  const written = await writeProfileSettings({ paths, publicOrigin, port: commandLine.port, driver: commandLine.driver });
  if (written instanceof WorkOsError) return written;

  const paired = await pairIfRequested(context);
  if (paired instanceof WorkOsError) return paired;

  const started = await installServices(context, names);
  if (started instanceof WorkOsError) return started;
  if (commandLine.isStartSkipped) return undefined;

  return reportServer(context, names, publicOrigin, port);
};

const serviceNames = (role: CliContext["commandLine"]["role"]): readonly ServiceName[] => {
  switch (role) {
    case "server":
      return ["server"];
    case "runner":
      return ["runner"];
    case "all":
      return SERVICE_NAMES;
    default:
      return role satisfies never;
  }
};

const prepareApp = async (context: CliContext, names: readonly ServiceName[]): Promise<WorkOsError | undefined> => {
  if (names.includes("server")) {
    const built = await ensureWebBuild({ appDirectory: context.appDirectory, isSkipped: context.commandLine.isBuildSkipped });
    if (built instanceof WorkOsError) return built;
  }
  if (!names.includes("runner")) return undefined;

  const image = await ensureGatewayImage(context.appDirectory);
  if (image instanceof WorkOsError) return image;
  if (image === "noDocker") {
    writeLine("Docker is not running, so runs cannot start until it is. Install Docker Desktop, or set --driver unsafeHost for trusted folders only.");
  }
  return undefined;
};

const pairIfRequested = async (context: CliContext): Promise<WorkOsError | undefined> => {
  const { serverUrl, code } = context.commandLine;
  const isRequested = serverUrl !== undefined && code !== undefined;
  if (!isRequested) return undefined;
  return runRunnerPair(context, serverUrl, code);
};

const installServices = async (context: CliContext, names: readonly ServiceName[]): Promise<WorkOsError | undefined> => {
  const services = describeServices({ nodePath: context.nodePath, appDirectory: context.appDirectory, paths: context.paths, searchPath: context.searchPath, names });
  for (const service of services) {
    const installed = await context.services.install(service);
    if (installed instanceof WorkOsError) return installed;
    writeLine(`Installed ${context.services.label(service)} (${context.services.filePath(service)}).`);
  }
  if (context.commandLine.isStartSkipped) return undefined;

  for (const service of services) {
    const started = await context.services.start(service);
    if (started instanceof WorkOsError) return started;
    writeLine(`Started ${service.name}.`);
  }
  return undefined;
};

const reportServer = async (context: CliContext, names: readonly ServiceName[], publicOrigin: string, port: number): Promise<WorkOsError | undefined> => {
  if (!names.includes("server")) return reportRemoteRunner(context);

  const status = await waitForServer(`http://127.0.0.1:${port}`);
  if (status instanceof WorkOsError) return new WorkOsError(`${status.message} Check the log: work-os logs server --profile ${context.paths.profile}`);
  if (status.isSetUp) {
    writeLine(`work-os is running. Open ${publicOrigin} and sign in with your passkey.`);
    return pairLocalIfWanted(context, names);
  }

  const setupCode = await readSetupCode(context.paths.serverLogFile);
  writeLine(`work-os is running. Open ${publicOrigin}, enter the setup code ${setupCode ?? "(see work-os logs server)"} and create a passkey there.`);
  writeLine("Create the passkey at that same address: passkeys only work at the address they were created on.");
  if (names.includes("runner")) {
    writeLine("Then run `work-os pair` once (no arguments) to pair this machine's runner.");
  }
  return undefined;
};

const reportRemoteRunner = async (context: CliContext): Promise<undefined> => {
  const pairing = await checkRunnerPairing(context.paths.runnerDataDirectory);
  if (pairing.status === "ok") return undefined;

  writeLine("This machine is not paired yet. Create a pairing code in Settings > Machines on the server, then run: work-os pair <server URL> <code>");
  return undefined;
};

const pairLocalIfWanted = async (context: CliContext, names: readonly ServiceName[]): Promise<WorkOsError | undefined> => {
  const isAlreadyPaired = (await checkRunnerPairing(context.paths.runnerDataDirectory)).status === "ok";
  const wantsPairing = names.includes("runner") && !isAlreadyPaired;
  if (!wantsPairing) return undefined;
  return pairLocalRunner(context);
};
