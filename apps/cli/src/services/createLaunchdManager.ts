import { WorkOsError } from "@work-os/shared/WorkOsError";
import { join } from "path";

import { runCommand } from "../runCommand.ts";
import { renderLaunchAgent, launchAgentLabel } from "./renderLaunchAgent.ts";
import type { ServiceIdentity, ServiceManager, ServiceStatus } from "./ServiceManager.ts";
import { removeServiceFile, writeServiceFile } from "./writeServiceFile.ts";

export type LaunchdManagerInput = {
  readonly homeDirectory: string;
  readonly userId: number;
};

// macOS login services. A LaunchAgent that is loaded keeps its process alive; "bootout" unloads it so it stays stopped.
export const createLaunchdManager = (input: LaunchdManagerInput): ServiceManager => {
  const domain = `gui/${input.userId}`;
  const filePath = (service: ServiceIdentity): string => join(input.homeDirectory, "Library/LaunchAgents", `${launchAgentLabel(service)}.plist`);
  const target = (service: ServiceIdentity): string => `${domain}/${launchAgentLabel(service)}`;

  const status = async (service: ServiceIdentity): Promise<ServiceStatus | WorkOsError> => {
    const printed = await runCommand("launchctl", ["print", target(service)]);
    if (printed instanceof WorkOsError) return printed;
    if (printed.exitCode !== 0) return { state: "notInstalled", processId: null };

    const processId = /^\s*pid = (\d+)/mu.exec(printed.output)?.[1];
    return processId === undefined ? { state: "stopped", processId: null } : { state: "running", processId: Number(processId) };
  };

  const start = async (service: ServiceIdentity): Promise<WorkOsError | undefined> => {
    const current = await status(service);
    if (current instanceof WorkOsError) return current;
    if (current.state !== "notInstalled") return expectSuccess(await runCommand("launchctl", ["kickstart", "-k", target(service)]), "restart");

    await runCommand("launchctl", ["enable", target(service)]);
    return expectSuccess(await runCommand("launchctl", ["bootstrap", domain, filePath(service)]), "start");
  };

  const stop = async (service: ServiceIdentity): Promise<WorkOsError | undefined> => {
    const current = await status(service);
    if (current instanceof WorkOsError) return current;
    if (current.state === "notInstalled") return undefined;
    return expectSuccess(await runCommand("launchctl", ["bootout", target(service)]), "stop");
  };

  return {
    label: launchAgentLabel,
    filePath,
    install: async (service) => writeServiceFile(filePath(service), renderLaunchAgent(service)),
    start,
    stop,
    status,
    uninstall: async (service) => {
      const stopped = await stop(service);
      if (stopped instanceof WorkOsError) return stopped;
      return removeServiceFile(filePath(service));
    },
  };
};

const expectSuccess = (result: Awaited<ReturnType<typeof runCommand>>, action: string): WorkOsError | undefined => {
  if (result instanceof WorkOsError) return result;
  if (result.exitCode === 0) return undefined;
  return new WorkOsError(`launchctl could not ${action} the service (exit ${result.exitCode}): ${result.output}`);
};
