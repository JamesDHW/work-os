import { APP_FOLDER, DEFAULT_PROFILE, PROFILE_NAME_PATTERN, RUNNER_FOLDER, SERVER_FOLDER, SIGN_IN_CODE_FILE, WORK_OS_FOLDER } from "./config.constants.ts";

/**
 * Everything one installation keeps on disk lives under ~/.work-os/<profile>/. A profile is a named
 * installation: "default" for everyday use, "dev" for development, or any name for a second server.
 */
export type ProfilePaths = {
  readonly profile: string;
  readonly root: string;
  readonly serverDataDirectory: string;
  readonly runnerDataDirectory: string;
  readonly serverEnvironmentFile: string;
  readonly runnerEnvironmentFile: string;
  readonly serverLogFile: string;
  readonly runnerLogFile: string;
  readonly signInCodeFile: string;
};

export const isProfileName = (value: string): boolean => PROFILE_NAME_PATTERN.test(value);

export const profilePaths = (homeDirectory: string, profile: string = DEFAULT_PROFILE): ProfilePaths => {
  const root = `${homeDirectory}/${WORK_OS_FOLDER}/${profile}`;
  const serverDataDirectory = `${root}/${SERVER_FOLDER}`;
  return {
    profile,
    root,
    serverDataDirectory,
    runnerDataDirectory: `${root}/${RUNNER_FOLDER}`,
    serverEnvironmentFile: `${root}/server.env`,
    runnerEnvironmentFile: `${root}/runner.env`,
    serverLogFile: `${root}/server.log`,
    runnerLogFile: `${root}/runner.log`,
    signInCodeFile: `${serverDataDirectory}/${SIGN_IN_CODE_FILE}`,
  };
};

/** The checkout the services run from when the CLI is not itself running inside one. */
export const managedAppDirectory = (homeDirectory: string): string => `${homeDirectory}/${WORK_OS_FOLDER}/${APP_FOLDER}`;
