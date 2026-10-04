import { z } from "zod";

import type { ConfigError } from "./ConfigError.ts";
import type { ConfigSource } from "./ConfigSource.ts";
import { DEFAULT_MODEL, DEFAULT_SERVER_HOST, DEFAULT_SERVER_PORT, SERVER_DATA_FOLDER } from "./config.constants.ts";
import { parseConfigValues } from "./parseConfigValues.ts";

const ServerConfigSchema = z.object({
  dataDirectory: z.string().min(1),
  port: z.coerce.number().int().min(1).max(65_535),
  host: z.string().min(1),
  publicOrigin: z.url(),
  webDistDirectory: z.string().min(1).nullable(),
  lmStudioUrl: z.url().nullable(),
  bundledPackagesDirectory: z.string().min(1),
  defaultModel: z.string().min(3),
  masterKey: z.string().min(1).nullable(),
  scriptedResponses: z.string().min(1).nullable(),
  setupCode: z.string().min(8).nullable(),
});

export type ServerConfig = z.infer<typeof ServerConfigSchema>;

export const parseServerConfig = (source: ConfigSource & { readonly bundledPackagesDirectory: string }): ServerConfig | ConfigError => {
  const { environment } = source;
  const port = environment["WORK_OS_PORT"] ?? String(DEFAULT_SERVER_PORT);

  return parseConfigValues(ServerConfigSchema, {
    dataDirectory: environment["WORK_OS_DATA_DIR"] ?? `${source.homeDirectory}/${SERVER_DATA_FOLDER}`,
    port,
    host: environment["WORK_OS_HOST"] ?? DEFAULT_SERVER_HOST,
    publicOrigin: environment["WORK_OS_PUBLIC_ORIGIN"] ?? `http://localhost:${port}`,
    webDistDirectory: environment["WORK_OS_WEB_DIST"] ?? null,
    lmStudioUrl: environment["WORK_OS_LMSTUDIO_URL"] ?? null,
    bundledPackagesDirectory: environment["WORK_OS_BUNDLED_DIR"] ?? source.bundledPackagesDirectory,
    defaultModel: environment["WORK_OS_DEFAULT_MODEL"] ?? DEFAULT_MODEL,
    masterKey: environment["WORK_OS_MASTER_KEY"] ?? null,
    scriptedResponses: environment["WORK_OS_SCRIPTED_RESPONSES"] ?? null,
    setupCode: environment["WORK_OS_SETUP_CODE"] ?? null,
  });
};
