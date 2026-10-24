import type { WorkOsError } from "@work-os/shared/WorkOsError";

import type { ServiceDefinition } from "./ServiceDefinition.ts";

export type ServiceState = "running" | "stopped" | "notInstalled";

export type ServiceStatus = {
  readonly state: ServiceState;
  readonly processId: number | null;
};

export type ServiceIdentity = Pick<ServiceDefinition, "profile" | "name">;

/** Login services on this machine: launchd on macOS, systemd user units on Linux. Every operation is idempotent. */
export type ServiceManager = {
  readonly label: (service: ServiceIdentity) => string;
  readonly filePath: (service: ServiceIdentity) => string;
  readonly install: (service: ServiceDefinition) => Promise<WorkOsError | undefined>;
  readonly start: (service: ServiceIdentity) => Promise<WorkOsError | undefined>;
  readonly stop: (service: ServiceIdentity) => Promise<WorkOsError | undefined>;
  readonly status: (service: ServiceIdentity) => Promise<ServiceStatus | WorkOsError>;
  readonly uninstall: (service: ServiceIdentity) => Promise<WorkOsError | undefined>;
};
