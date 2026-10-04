import type { EnvironmentDefinition } from "@work-os/domain/environments/EnvironmentDefinition";
import { toEnvironmentId } from "@work-os/domain/identifiers/Identifiers";
import { DevcontainerSchema } from "@work-os/protocol/package/devcontainer.schema";
import { InvalidRequestError } from "@work-os/shared/InvalidRequestError";
import { tryCatch } from "@work-os/shared/tryCatch";
import { WorkOsError } from "@work-os/shared/WorkOsError";
import { join } from "path";

import { DEVCONTAINER_FILE } from "../files/files.constants.ts";
import { parseWithSchema } from "@work-os/protocol/common/parseWithSchema";
import { readTextFile } from "../files/readTextFile.ts";

export const readEnvironment = async (environmentDirectory: string, folderName: string): Promise<EnvironmentDefinition | WorkOsError> => {
  const fileName = `environments/${folderName}/${DEVCONTAINER_FILE}`;
  const text = await readTextFile(join(environmentDirectory, DEVCONTAINER_FILE));
  if (text instanceof WorkOsError) return text;

  const json = tryCatch((): unknown => JSON.parse(text));
  if (json instanceof WorkOsError) return new InvalidRequestError(`${fileName} is not valid JSON: ${json.message}`);

  const devcontainer = parseWithSchema(DevcontainerSchema, json, fileName);
  if (devcontainer instanceof WorkOsError) return devcontainer;

  return {
    id: toEnvironmentId(folderName),
    devcontainer,
    egress: devcontainer.customizations?.workos?.egress ?? [],
  };
};
