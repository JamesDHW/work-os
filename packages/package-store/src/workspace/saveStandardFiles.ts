import type { WorkspaceId } from "@work-os/domain/identifiers/Identifiers";
import type { Standard } from "@work-os/domain/standards/Standard";
import { tryCatchAsync } from "@work-os/shared/tryCatch";
import { WorkOsError } from "@work-os/shared/WorkOsError";
import { mkdir, rm, writeFile } from "fs/promises";
import { join } from "path";

import { METHOD_FILE, STANDARD_FILE, STANDARDS_FOLDER } from "../files/files.constants.ts";
import { commitAll } from "../git/commitAll.ts";
import { serializeStandard } from "../standards/serializeStandard.ts";

type SaveStandardFilesOptions = {
  readonly workspaceDirectory: (workspaceId: WorkspaceId) => string;
};

export const createSaveStandardFiles = (options: SaveStandardFilesOptions) => {
  return async (workspaceId: WorkspaceId, standard: Standard): Promise<Standard | WorkOsError> => {
    const directory = options.workspaceDirectory(workspaceId);
    const standardDirectory = join(directory, STANDARDS_FOLDER, standard.id);
    const files = serializeStandard(standard);

    const written = await tryCatchAsync(async () => {
      await mkdir(standardDirectory, { recursive: true });
      await writeFile(join(standardDirectory, STANDARD_FILE), files.standardMarkdown);
      await writeOrRemoveMethod(join(standardDirectory, METHOD_FILE), files.methodMarkdown);
    });
    if (written instanceof WorkOsError) return written;

    const committed = await commitAll(directory, `Update standard ${standard.id}`);
    if (committed instanceof WorkOsError) return committed;

    return standard;
  };
};

const writeOrRemoveMethod = async (path: string, methodMarkdown: string): Promise<void> => {
  if (methodMarkdown.length === 0) return rm(path, { force: true });

  return writeFile(path, methodMarkdown);
};
