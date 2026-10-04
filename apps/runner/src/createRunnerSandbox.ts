import type { RunnerConfig } from "@work-os/config/RunnerConfig";
import { createSandbox, type Sandbox } from "@work-os/sandbox/createSandbox";
import type { EgressController } from "@work-os/sandbox/egress/EgressController";
import { createEgressController } from "@work-os/sandbox/egress/createEgressController";
import { createDockerDriver } from "@work-os/sandbox/environments/createDockerDriver";
import { createHostDriver } from "@work-os/sandbox/environments/createHostDriver";
import type { EnvironmentDriver } from "@work-os/sandbox/environments/EnvironmentDriver";
import { createManifestStore } from "@work-os/sandbox/outputs/createManifestStore";
import { randomBytes } from "crypto";
import { join } from "path";

import { DEFAULT_GATEWAY_CONTROL_PORT } from "./runner.constants.ts";

export type RunnerSandbox = {
  readonly sandbox: Sandbox;
  readonly egressController: EgressController | null;
};

export const createRunnerSandbox = (config: RunnerConfig): RunnerSandbox => {
  const runsDirectory = join(config.dataDirectory, "runs");
  const egressController = config.environmentDriver === "docker" ? createDockerEgress(config) : null;
  const driver = chooseDriver(config, runsDirectory, egressController);
  return { sandbox: createSandbox({ driver, manifestStore: createManifestStore(runsDirectory) }), egressController };
};

const createDockerEgress = (config: RunnerConfig): EgressController => {
  return createEgressController({ image: config.egressGatewayImage, token: randomBytes(24).toString("hex"), controlPort: DEFAULT_GATEWAY_CONTROL_PORT });
};

const chooseDriver = (config: RunnerConfig, runsDirectory: string, egressController: EgressController | null): EnvironmentDriver => {
  if (egressController === null) return createHostDriver();

  const devcontainerCommand = new URL("../node_modules/.bin/devcontainer", import.meta.url).pathname;
  return createDockerDriver({ runsDirectory, devcontainerCommand, egressController });
};
