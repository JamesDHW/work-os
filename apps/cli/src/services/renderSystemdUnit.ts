import { SYSTEMD_UNIT_PREFIX } from "../cli.constants.ts";
import type { ServiceDefinition } from "./ServiceDefinition.ts";

const quote = (text: string): string => `"${text.replaceAll("\\", "\\\\").replaceAll('"', '\\"')}"`;

export const systemdUnitName = (service: Pick<ServiceDefinition, "profile" | "name">): string =>
  `${SYSTEMD_UNIT_PREFIX}-${service.profile}-${service.name}.service`;

// A systemd user unit that starts the service at login and restarts it when it fails.
export const renderSystemdUnit = (service: ServiceDefinition): string =>
  [
    "[Unit]",
    `Description=${service.description}`,
    "After=network-online.target",
    "",
    "[Service]",
    `ExecStart=${service.programArguments.map(quote).join(" ")}`,
    `WorkingDirectory=${service.workingDirectory}`,
    ...Object.entries(service.environment).map(([name, value]) => `Environment=${quote(`${name}=${value}`)}`),
    "Restart=on-failure",
    "RestartSec=5",
    "",
    "[Install]",
    "WantedBy=default.target",
    "",
  ].join("\n");
