import type { RunnerConfig } from "@work-os/config/RunnerConfig";
import { createSandbox, type Sandbox } from "@work-os/sandbox/createSandbox";
import type { EgressController } from "@work-os/sandbox/egress/EgressController";
import { createEgressController } from "@work-os/sandbox/egress/createEgressController";
import { createDockerDriver } from "@work-os/sandbox/environments/createDockerDriver";
import { createHostDriver } from "@work-os/sandbox/environments/createHostDriver";
import type { EnvironmentDriver } from "@work-os/sandbox/environments/EnvironmentDriver";
import { createManifestStore, type ManifestStore } from "@work-os/sandbox/outputs/createManifestStore";
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
  const manifestStore = createManifestStore(runsDirectory);
  const driver = chooseDriver(config, runsDirectory, egressController, manifestStore);
  return { sandbox: createSandbox({ driver, manifestStore }), egressController };
};

const createDockerEgress = (config: RunnerConfig): EgressController => {
  return createEgressController({ image: config.egressGatewayImage, token: randomBytes(24).toString("hex"), controlPort: DEFAULT_GATEWAY_CONTROL_PORT });
};

const chooseDriver = (config: RunnerConfig, runsDirectory: string, egressController: EgressController | null, manifestStore: ManifestStore): EnvironmentDriver => {
  if (egressController === null) return createHostDriver(manifestStore);

  const devcontainerCommand = new URL("../node_modules/.bin/devcontainer", import.meta.url).pathname;
  return createDockerDriver({ runsDirectory, devcontainerCommand, egressController });
};
