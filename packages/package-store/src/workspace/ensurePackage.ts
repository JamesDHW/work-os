import type { Workspace } from "@work-os/domain/workspaces/Workspace";
import type { WorkspaceId } from "@work-os/domain/identifiers/Identifiers";
import { tryCatchAsync } from "@work-os/shared/tryCatch";
import { WorkOsError } from "@work-os/shared/WorkOsError";
import { access, mkdir, writeFile } from "fs/promises";
import { join } from "path";
import { stringify } from "yaml";

import { MANIFEST_FILE, STANDARDS_FOLDER } from "../files/files.constants.ts";
import { commitAll } from "../git/commitAll.ts";
import { runGit } from "../git/runGit.ts";

type EnsurePackageOptions = {
  readonly workspaceDirectory: (workspaceId: WorkspaceId) => string;
  readonly defaultModel: string;
  readonly defaultExtends: readonly string[];
};

export const createEnsurePackage = (options: EnsurePackageOptions) => {
  return async (workspace: Workspace): Promise<string | WorkOsError> => {
    const directory = options.workspaceDirectory(workspace.id);
    const existing = await tryCatchAsync(() => access(join(directory, MANIFEST_FILE)));
    if (!(existing instanceof WorkOsError)) return runGit(directory, ["rev-parse", "HEAD"]);

    const created = await writeInitialPackage(directory, options, workspace);
    if (created instanceof WorkOsError) return created;

    const initialised = await runGit(directory, ["init", "--quiet", "--initial-branch=main"]);
    if (initialised instanceof WorkOsError) return initialised;

    return commitAll(directory, "Create the workspace package");
  };
};

const writeInitialPackage = async (directory: string, options: EnsurePackageOptions, workspace: Workspace) => {
  const manifest = { name: workspace.name, extends: options.defaultExtends, models: { default: options.defaultModel } };
  return tryCatchAsync(async () => {
    await mkdir(join(directory, STANDARDS_FOLDER), { recursive: true });
    await writeFile(join(directory, STANDARDS_FOLDER, ".gitkeep"), "");
    await writeFile(join(directory, MANIFEST_FILE), stringify(manifest));
  });
};
