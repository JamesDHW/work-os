import { InvalidRequestError } from "@work-os/shared/InvalidRequestError";
import { tryCatch } from "@work-os/shared/tryCatch";
import { WorkOsError } from "@work-os/shared/WorkOsError";
import { parseArgs } from "util";

import { COMMAND_LINE_OPTIONS, DRIVERS, EXPOSURES, ROLES } from "./commandLine.constants.ts";

export type Role = (typeof ROLES)[number];
export type Exposure = (typeof EXPOSURES)[number];
export type Driver = (typeof DRIVERS)[number];

export type CommandLine = {
  readonly command: string | undefined;
  readonly positionals: readonly string[];
  readonly profile: string | undefined;
  readonly serverUrl: string | undefined;
  readonly role: Role;
  readonly exposure: Exposure | undefined;
  readonly origin: string | undefined;
  readonly driver: Driver | undefined;
  readonly port: number | undefined;
  readonly webPort: number | undefined;
  readonly repository: string | undefined;
  readonly appDirectory: string | undefined;
  readonly code: string | undefined;
  readonly isRunnerSkipped: boolean;
  readonly isStartSkipped: boolean;
  readonly isBuildSkipped: boolean;
  readonly isFollowing: boolean;
  readonly isConfirmed: boolean;
};

export const parseCommandLine = (commandLineArguments: readonly string[]): CommandLine | WorkOsError => {
  const parsed = tryCatch(() => parseArgs({ args: [...commandLineArguments], allowPositionals: true, strict: true, options: COMMAND_LINE_OPTIONS }));
  if (parsed instanceof WorkOsError) return new InvalidRequestError(parsed.message, { cause: parsed });

  const { values } = parsed;
  const role = oneOf("--role", values.role ?? "all", ROLES);
  if (role instanceof WorkOsError) return role;
  const exposure = optionalOneOf("--expose", values.expose, EXPOSURES);
  if (exposure instanceof WorkOsError) return exposure;
  const driver = optionalOneOf("--driver", values.driver, DRIVERS);
  if (driver instanceof WorkOsError) return driver;
  const port = optionalPort("--port", values.port);
  if (port instanceof WorkOsError) return port;
  const webPort = optionalPort("--web-port", values["web-port"]);
  if (webPort instanceof WorkOsError) return webPort;

  const [command, ...positionals] = parsed.positionals;
  return {
    command,
    positionals,
    profile: values.profile,
    serverUrl: values.server,
    role,
    exposure,
    origin: values.origin,
    driver,
    port,
    webPort,
    repository: values.repo,
    appDirectory: values["app-dir"],
    code: values.code,
    isRunnerSkipped: values["no-runner"] === true,
    isStartSkipped: values["no-start"] === true,
    isBuildSkipped: values["skip-build"] === true,
    isFollowing: values.follow === true,
    isConfirmed: values.yes === true,
  };
};

const oneOf = <Choice extends string>(option: string, value: string, choices: readonly Choice[]): Choice | WorkOsError => {
  const choice = choices.find((candidate) => candidate === value);
  if (choice === undefined) return new InvalidRequestError(`${option} must be one of ${choices.join(", ")}, not "${value}".`);
  return choice;
};

const optionalOneOf = <Choice extends string>(option: string, value: string | undefined, choices: readonly Choice[]): Choice | undefined | WorkOsError => {
  if (value === undefined) return undefined;
  return oneOf(option, value, choices);
};

const optionalPort = (option: string, value: string | undefined): number | undefined | WorkOsError => {
  if (value === undefined) return undefined;

  const port = Number(value);
  const isPort = Number.isInteger(port) && port > 0 && port < 65_536;
  if (!isPort) return new InvalidRequestError(`${option} must be a port number, not "${value}".`);
  return port;
};
