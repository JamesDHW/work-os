import type { JsonObject, JsonValue } from "@work-os/domain/json/Json";

import { EGRESS_GATEWAY_CONTAINER, EGRESS_NETWORK, EGRESS_PROXY_PORT, RUN_LABEL, WORKSPACE_MOUNT_PATH } from "../sandbox.constants.ts";

export type EffectiveDevcontainerInput = {
  readonly devcontainer: JsonObject;
  readonly projectPath: string;
  readonly runId: string;
};

export const composeEffectiveDevcontainer = (input: EffectiveDevcontainerInput): JsonObject => {
  const proxyUrl = `http://${EGRESS_GATEWAY_CONTAINER}:${EGRESS_PROXY_PORT}`;
  const userRunArgs = asStringList(input.devcontainer["runArgs"]);
  const userEnvironment = asObject(input.devcontainer["containerEnv"]);

  return {
    ...input.devcontainer,
    workspaceMount: `source=${input.projectPath},target=${WORKSPACE_MOUNT_PATH},type=bind`,
    workspaceFolder: WORKSPACE_MOUNT_PATH,
    runArgs: [...userRunArgs.filter((argument) => !argument.startsWith("--network")), `--network=${EGRESS_NETWORK}`, `--label=${RUN_LABEL}=${input.runId}`],
    containerEnv: {
      ...userEnvironment,
      HTTP_PROXY: proxyUrl,
      HTTPS_PROXY: proxyUrl,
      http_proxy: proxyUrl,
      https_proxy: proxyUrl,
      NO_PROXY: "localhost,127.0.0.1",
    },
  };
};

const asStringList = (value: JsonValue | undefined): readonly string[] => {
  if (!Array.isArray(value)) return [];

  return value.filter((entry): entry is string => typeof entry === "string");
};

const asObject = (value: JsonValue | undefined): JsonObject => (isJsonObject(value) ? value : {});

const isJsonObject = (value: JsonValue | undefined): value is JsonObject => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};
