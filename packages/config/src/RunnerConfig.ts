import { z } from "zod";

import type { ConfigError } from "./ConfigError.ts";
import type { ConfigSource } from "./ConfigSource.ts";
import { RUNNER_DATA_FOLDER } from "./config.constants.ts";
import { parseConfigValues } from "./parseConfigValues.ts";

const RunnerConfigSchema = z.object({
  dataDirectory: z.string().min(1),
  environmentDriver: z.enum(["docker", "unsafeHost"]),
  egressGatewayImage: z.string().min(1),
});

export type RunnerConfig = z.infer<typeof RunnerConfigSchema>;

export const parseRunnerConfig = (source: ConfigSource): RunnerConfig | ConfigError => {
  const { environment } = source;

  return parseConfigValues(RunnerConfigSchema, {
    dataDirectory: environment["WORK_OS_RUNNER_DATA_DIR"] ?? `${source.homeDirectory}/${RUNNER_DATA_FOLDER}`,
    environmentDriver: environment["WORK_OS_RUNNER_DRIVER"] ?? "docker",
    egressGatewayImage: environment["WORK_OS_EGRESS_IMAGE"] ?? "work-os/egress-gateway:local",
  });
};
