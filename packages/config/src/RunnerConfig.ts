import { z } from "zod";

import type { ConfigError } from "./ConfigError.ts";
import type { ConfigSource } from "./ConfigSource.ts";
import { DEFAULT_PROFILE, PROFILE_NAME_PATTERN } from "./config.constants.ts";
import { parseConfigValues } from "./parseConfigValues.ts";
import { profilePaths } from "./ProfilePaths.ts";

const RunnerConfigSchema = z.object({
  profile: z.string().regex(PROFILE_NAME_PATTERN),
  dataDirectory: z.string().min(1),
  environmentDriver: z.enum(["docker", "unsafeHost"]),
  egressGatewayImage: z.string().min(1),
});

export type RunnerConfig = z.infer<typeof RunnerConfigSchema>;

export const parseRunnerConfig = (source: ConfigSource): RunnerConfig | ConfigError => {
  const { environment } = source;
  const profile = environment["WORK_OS_PROFILE"] ?? DEFAULT_PROFILE;

  return parseConfigValues(RunnerConfigSchema, {
    profile,
    dataDirectory: environment["WORK_OS_RUNNER_DATA_DIR"] ?? profilePaths(source.homeDirectory, profile).runnerDataDirectory,
    environmentDriver: environment["WORK_OS_RUNNER_DRIVER"] ?? "docker",
    egressGatewayImage: environment["WORK_OS_EGRESS_IMAGE"] ?? "work-os/egress-gateway:local",
  });
};
