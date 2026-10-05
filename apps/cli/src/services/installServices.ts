import { InvalidRequestError } from "@work-os/shared/InvalidRequestError";
import { tryCatchAsync } from "@work-os/shared/tryCatch";
import { WorkOsError } from "@work-os/shared/WorkOsError";
import { mkdir, stat, writeFile } from "fs/promises";
import { dirname, join } from "path";

import { ENVIRONMENT_FILE_MODE } from "../cli.constants.ts";

import { writeLine } from "../writeLine.ts";
import { launchAgentLabel, renderLaunchAgent } from "./renderLaunchAgent.ts";
import { renderSystemdUnit, systemdUnitName } from "./renderSystemdUnit.ts";
import type { ServiceDefinition } from "./ServiceDefinition.ts";

export type InstallServicesInput = {
  readonly platform: string;
  readonly homeDirectory: string;
  readonly services: readonly ServiceDefinition[];
};

type ServiceFile = {
  readonly path: string;
  readonly contents: string;
  readonly startCommand: string;
};

const toServiceFile = (platform: string, homeDirectory: string, service: ServiceDefinition): ServiceFile | WorkOsError => {
  switch (platform) {
    case "darwin": {
      const path = join(homeDirectory, "Library/LaunchAgents", `${launchAgentLabel(service)}.plist`);
      return { path, contents: renderLaunchAgent(service), startCommand: `launchctl bootstrap gui/$(id -u) ${path}` };
    }
    case "linux": {
      const path = join(homeDirectory, ".config/systemd/user", systemdUnitName(service));
      return { path, contents: renderSystemdUnit(service), startCommand: `systemctl --user enable --now ${systemdUnitName(service)}` };
    }
    default:
      return new InvalidRequestError(`work-os install supports macOS and Linux, not ${platform}.`);
  }
};

// Creates the service's settings file from its template, and leaves an existing one alone.
const writeEnvironmentFile = async (service: ServiceDefinition): Promise<WorkOsError | undefined> => {
  const existing = await tryCatchAsync(async () => stat(service.environmentFile));
  const isPresent = !(existing instanceof WorkOsError);
  if (isPresent) return undefined;

  const written = await tryCatchAsync(async () => {
    await mkdir(dirname(service.environmentFile), { recursive: true, mode: 0o700 });
    await writeFile(service.environmentFile, service.environmentTemplate, { mode: ENVIRONMENT_FILE_MODE });
  });
  if (written instanceof WorkOsError) return written;

  writeLine(`Wrote ${service.environmentFile}: the ${service.name} settings, loaded when it starts.`);
  return undefined;
};

// Writes one service file per service and prints the command that starts each. It never starts anything itself.
export const installServices = async (input: InstallServicesInput): Promise<WorkOsError | undefined> => {
  for (const service of input.services) {
    const serviceFile = toServiceFile(input.platform, input.homeDirectory, service);
    if (serviceFile instanceof WorkOsError) return serviceFile;

    const environmentWritten = await writeEnvironmentFile(service);
    if (environmentWritten instanceof WorkOsError) return environmentWritten;

    const written = await tryCatchAsync(async () => {
      await mkdir(dirname(serviceFile.path), { recursive: true });
      await writeFile(serviceFile.path, serviceFile.contents);
    });
    if (written instanceof WorkOsError) return written;

    writeLine(`Wrote ${serviceFile.path}`);
    writeLine(`  Start it with: ${serviceFile.startCommand}`);
  }
  return undefined;
};
