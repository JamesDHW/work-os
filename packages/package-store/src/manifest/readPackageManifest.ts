import { WorkspaceManifestSchema, type WorkspaceManifest } from "@work-os/protocol/package/workspaceManifest.schema";
import { InvalidRequestError } from "@work-os/shared/InvalidRequestError";
import { tryCatch } from "@work-os/shared/tryCatch";
import { WorkOsError } from "@work-os/shared/WorkOsError";
import { join } from "path";
import { parse } from "yaml";

import { MANIFEST_FILE } from "../files/files.constants.ts";
import { parseWithSchema } from "@work-os/protocol/common/parseWithSchema";
import { readTextFile } from "../files/readTextFile.ts";

export const readPackageManifest = async (packageDirectory: string): Promise<WorkspaceManifest | WorkOsError> => {
  const text = await readTextFile(join(packageDirectory, MANIFEST_FILE));
  if (text instanceof WorkOsError) return text;

  const attributes = tryCatch((): unknown => parse(text));
  if (attributes instanceof WorkOsError) return new InvalidRequestError(`${MANIFEST_FILE} is not valid YAML: ${attributes.message}`);

  return parseWithSchema(WorkspaceManifestSchema, attributes, MANIFEST_FILE);
};
