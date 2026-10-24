import { WorkOsError } from "@work-os/shared/WorkOsError";

import { isAppDirectory } from "../appDirectory.ts";
import type { CliContext } from "../CliContext.ts";
import { DEFAULT_REPOSITORY, SERVICE_NAMES } from "../cli.constants.ts";
import { runInTerminal, type TerminalCommand } from "../runInTerminal.ts";
import type { ServiceIdentity } from "../services/ServiceManager.ts";
import { ensureGatewayImage } from "../setup/ensureGatewayImage.ts";
import { ensureWebBuild } from "../setup/ensureWebBuild.ts";
import { writeLine } from "../writeLine.ts";

// Brings the checkout the services run from up to date, rebuilds what they serve and restarts whatever is installed.
export const runUpdate = async (context: CliContext): Promise<WorkOsError | undefined> => {
  const fetched = await fetchApp(context);
  if (fetched instanceof WorkOsError) return fetched;

  const installed = await step({ command: "pnpm", arguments: ["install", "--frozen-lockfile"], cwd: context.appDirectory }, "pnpm install");
  if (installed instanceof WorkOsError) return installed;

  const built = await ensureWebBuild({ appDirectory: context.appDirectory, isSkipped: context.commandLine.isBuildSkipped });
  if (built instanceof WorkOsError) return built;

  const image = await ensureGatewayImage(context.appDirectory);
  if (image instanceof WorkOsError) return image;

  return restartInstalled(context);
};

const fetchApp = async (context: CliContext): Promise<WorkOsError | undefined> => {
  const isCheckout = await isAppDirectory(context.appDirectory);
  if (isCheckout) {
    writeLine(`Updating ${context.appDirectory}…`);
    return step({ command: "git", arguments: ["-C", context.appDirectory, "pull", "--ff-only"], }, "git pull");
  }

  const repository = context.commandLine.repository ?? DEFAULT_REPOSITORY;
  writeLine(`Cloning ${repository} into ${context.appDirectory}…`);
  return step({ command: "git", arguments: ["clone", repository, context.appDirectory] }, "git clone");
};

const step = async (terminalCommand: TerminalCommand, label: string): Promise<WorkOsError | undefined> => {
  const exitCode = await runInTerminal(terminalCommand);
  if (exitCode instanceof WorkOsError) return exitCode;
  if (exitCode !== 0) return new WorkOsError(`${label} failed (exit ${exitCode}).`);
  return undefined;
};

const restartInstalled = async (context: CliContext): Promise<WorkOsError | undefined> => {
  const installed = await installedServices(context);
  if (installed instanceof WorkOsError) return installed;

  for (const service of installed) {
    const restarted = await context.services.start(service);
    if (restarted instanceof WorkOsError) return restarted;
    writeLine(`Restarted ${service.name} (${context.paths.profile}).`);
  }
  return undefined;
};

const installedServices = async (context: CliContext): Promise<readonly ServiceIdentity[] | WorkOsError> => {
  const services = SERVICE_NAMES.map((name) => ({ profile: context.paths.profile, name }));
  const statuses = await Promise.all(services.map((service) => context.services.status(service)));
  const failure = statuses.find((status): status is WorkOsError => status instanceof WorkOsError);
  if (failure !== undefined) return failure;

  return services.filter((_service, index) => statuses[index] !== undefined && !(statuses[index] instanceof WorkOsError) && statuses[index].state !== "notInstalled");
};
