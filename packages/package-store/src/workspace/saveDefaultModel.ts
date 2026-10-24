import type { WorkspaceId } from "@work-os/domain/identifiers/Identifiers";
import { tryCatchAsync } from "@work-os/shared/tryCatch";
import { WorkOsError } from "@work-os/shared/WorkOsError";
import { writeFile } from "fs/promises";
import { join } from "path";
import { stringify } from "yaml";

import { MANIFEST_FILE } from "../files/files.constants.ts";
import { commitAll } from "../git/commitAll.ts";
import { readPackageManifest } from "../manifest/readPackageManifest.ts";

type SaveDefaultModelOptions = {
  readonly workspaceDirectory: (workspaceId: WorkspaceId) => string;
};

// The default model is part of the workspace package (workos.yaml), so changing it in the app is a commit like any other edit.
export const createSaveDefaultModel = (options: SaveDefaultModelOptions) => {
  return async (workspaceId: WorkspaceId, model: string): Promise<WorkOsError | undefined> => {
    const directory = options.workspaceDirectory(workspaceId);
    const manifest = await readPackageManifest(directory);
    if (manifest instanceof WorkOsError) return manifest;

    const updated = { ...manifest, models: { ...manifest.models, default: model } };
    const written = await tryCatchAsync(() => writeFile(join(directory, MANIFEST_FILE), stringify(updated)));
    if (written instanceof WorkOsError) return written;

    const committed = await commitAll(directory, `Set the default model to ${model}`);
    return committed instanceof WorkOsError ? committed : undefined;
  };
};
