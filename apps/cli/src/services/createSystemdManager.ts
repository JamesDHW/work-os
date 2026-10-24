import { WorkOsError } from "@work-os/shared/WorkOsError";
import { join } from "path";

import { runCommand } from "../runCommand.ts";
import { renderSystemdUnit, systemdUnitName } from "./renderSystemdUnit.ts";
import type { ServiceIdentity, ServiceManager, ServiceStatus } from "./ServiceManager.ts";
import { removeServiceFile, writeServiceFile } from "./writeServiceFile.ts";

export type SystemdManagerInput = {
  readonly homeDirectory: string;
};

// Linux login services as systemd user units.
export const createSystemdManager = (input: SystemdManagerInput): ServiceManager => {
  const filePath = (service: ServiceIdentity): string => join(input.homeDirectory, ".config/systemd/user", systemdUnitName(service));

  const status = async (service: ServiceIdentity): Promise<ServiceStatus | WorkOsError> => {
    const shown = await runCommand("systemctl", ["--user", "show", systemdUnitName(service), "--property=LoadState,ActiveState,MainPID"]);
    if (shown instanceof WorkOsError) return shown;

    const property = (name: string): string | undefined => new RegExp(`^${name}=(.*)$`, "mu").exec(shown.output)?.[1];
    if (property("LoadState") !== "loaded") return { state: "notInstalled", processId: null };

    const processId = Number(property("MainPID") ?? "0");
    const isActive = property("ActiveState") === "active" && processId > 0;
    return isActive ? { state: "running", processId } : { state: "stopped", processId: null };
  };

  const stop = async (service: ServiceIdentity): Promise<WorkOsError | undefined> => {
    const current = await status(service);
    if (current instanceof WorkOsError) return current;
    if (current.state === "notInstalled") return undefined;
    return expectSuccess(await runCommand("systemctl", ["--user", "disable", "--now", systemdUnitName(service)]), "stop");
  };

  return {
    label: systemdUnitName,
    filePath,
    install: async (service) => {
      const written = await writeServiceFile(filePath(service), renderSystemdUnit(service));
      if (written instanceof WorkOsError) return written;
      return expectSuccess(await runCommand("systemctl", ["--user", "daemon-reload"]), "reload");
    },
    start: async (service) => expectSuccess(await runCommand("systemctl", ["--user", "enable", "--now", systemdUnitName(service)]), "start"),
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
  return new WorkOsError(`systemctl could not ${action} the service (exit ${result.exitCode}): ${result.output}`);
};
