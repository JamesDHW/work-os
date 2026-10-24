import { z } from "zod";

import type { ConfigError } from "./ConfigError.ts";
import type { ConfigSource } from "./ConfigSource.ts";
import { DEFAULT_PROFILE, DEFAULT_SERVER_HOST, DEFAULT_SERVER_PORT, PROFILE_NAME_PATTERN, SIGN_IN_CODE_FILE } from "./config.constants.ts";
import { parseConfigValues } from "./parseConfigValues.ts";
import { profilePaths } from "./ProfilePaths.ts";

const ServerConfigSchema = z.object({
  profile: z.string().regex(PROFILE_NAME_PATTERN),
  dataDirectory: z.string().min(1),
  signInCodeFile: z.string().min(1),
  port: z.coerce.number().int().min(1).max(65_535),
  host: z.string().min(1),
  publicOrigin: z.url(),
  webDistDirectory: z.string().min(1).nullable(),
  lmStudioUrl: z.url().nullable(),
  bundledPackagesDirectory: z.string().min(1),
  defaultModel: z.string().min(3).nullable(),
  masterKey: z.string().min(1).nullable(),
  scriptedResponses: z.string().min(1).nullable(),
  setupCode: z.string().min(8).nullable(),
  isDevAutoSignIn: z.boolean(),
});

export type ServerConfig = z.infer<typeof ServerConfigSchema>;

export type ServerConfigSource = ConfigSource & {
  readonly bundledPackagesDirectory: string;
  /** The built web app next to this checkout, served when WORK_OS_WEB_DIST is not set and the folder exists. */
  readonly defaultWebDistDirectory?: string | null;
};

export const parseServerConfig = (source: ServerConfigSource): ServerConfig | ConfigError => {
  const { environment } = source;
  const profile = environment["WORK_OS_PROFILE"] ?? DEFAULT_PROFILE;
  const paths = profilePaths(source.homeDirectory, profile);
  const dataDirectory = environment["WORK_OS_DATA_DIR"] ?? paths.serverDataDirectory;
  const port = environment["WORK_OS_PORT"] ?? String(DEFAULT_SERVER_PORT);

  return parseConfigValues(ServerConfigSchema, {
    profile,
    dataDirectory,
    signInCodeFile: `${dataDirectory}/${SIGN_IN_CODE_FILE}`,
    port,
    host: environment["WORK_OS_HOST"] ?? DEFAULT_SERVER_HOST,
    publicOrigin: environment["WORK_OS_PUBLIC_ORIGIN"] ?? `http://localhost:${port}`,
    webDistDirectory: environment["WORK_OS_WEB_DIST"] ?? source.defaultWebDistDirectory ?? null,
    lmStudioUrl: environment["WORK_OS_LMSTUDIO_URL"] ?? null,
    bundledPackagesDirectory: environment["WORK_OS_BUNDLED_DIR"] ?? source.bundledPackagesDirectory,
    defaultModel: environment["WORK_OS_DEFAULT_MODEL"] ?? null,
    masterKey: environment["WORK_OS_MASTER_KEY"] ?? null,
    scriptedResponses: environment["WORK_OS_SCRIPTED_RESPONSES"] ?? null,
    setupCode: environment["WORK_OS_SETUP_CODE"] ?? null,
    isDevAutoSignIn: environment["WORK_OS_DEV_AUTO_SIGN_IN"] === "1",
  });
};
