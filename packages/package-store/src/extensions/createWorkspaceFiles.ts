import { CapabilityError } from "@work-os/sdk/CapabilityError";
import type { WorkspaceFiles } from "@work-os/sdk/HostServices";
import { tryCatchAsync } from "@work-os/shared/tryCatch";
import { WorkOsError } from "@work-os/shared/WorkOsError";
import { mkdir, writeFile } from "fs/promises";
import { dirname, join } from "path";

import { SAFE_RELATIVE_PATH_PATTERN } from "../files/files.constants.ts";
import { readTextFile } from "../files/readTextFile.ts";
import { commitAll } from "../git/commitAll.ts";
import { validatePackageFile } from "./validatePackageFile.ts";

export const createWorkspaceFiles = (directory: string, onChanged: () => void): WorkspaceFiles => ({
  readFile: async (path) => {
    if (!SAFE_RELATIVE_PATH_PATTERN.test(path)) return new CapabilityError(`"${path}" is not a workspace package path.`);

    const text = await readTextFile(join(directory, path));
    if (text instanceof WorkOsError) return new CapabilityError(`${path} does not exist in the workspace package.`);
    return text;
  },
  writeFiles: async (files, message) => {
    const problems = Object.entries(files).flatMap(([path, content]) => validatePackageFile(path, content));
    if (problems.length > 0) return new CapabilityError(problems.join("\n"));

    const written = await tryCatchAsync(() => Promise.all(Object.entries(files).map(([path, content]) => writePackageFile(directory, path, content))));
    if (written instanceof WorkOsError) return new CapabilityError(`Could not write the files: ${written.message}`);

    const revision = await commitAll(directory, message);
    if (revision instanceof WorkOsError) return new CapabilityError(`Could not commit the files: ${revision.message}`);

    onChanged();
    return revision;
  },
});

const writePackageFile = async (directory: string, path: string, content: string): Promise<void> => {
  const absolutePath = join(directory, path);
  await mkdir(dirname(absolutePath), { recursive: true });
  return writeFile(absolutePath, content);
};
