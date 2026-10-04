import type { RunId } from "@work-os/domain/identifiers/Identifiers";
import type { FileManifest } from "@work-os/domain/runs/ChangedFile";
import { InvalidRequestError } from "@work-os/shared/InvalidRequestError";
import { tryCatch, tryCatchAsync } from "@work-os/shared/tryCatch";
import { WorkOsError } from "@work-os/shared/WorkOsError";
import { mkdir, readFile, writeFile } from "fs/promises";
import { join } from "path";

export type ManifestStore = {
  readonly saveStartManifest: (runId: RunId, manifest: FileManifest) => Promise<WorkOsError | undefined>;
  readonly readStartManifest: (runId: RunId) => Promise<FileManifest | WorkOsError>;
  readonly saveProjectPath: (runId: RunId, projectPath: string) => Promise<WorkOsError | undefined>;
  readonly readProjectPath: (runId: RunId) => Promise<string | WorkOsError>;
};

export const createManifestStore = (runsDirectory: string): ManifestStore => {
  const manifestPath = (runId: RunId): string => join(runsDirectory, runId, "start-manifest.json");
  const projectPathFile = (runId: RunId): string => join(runsDirectory, runId, "project-path");
  const writeRunFile = async (runId: RunId, path: string, content: string): Promise<WorkOsError | undefined> => {
    const saved = await tryCatchAsync(async () => {
      await mkdir(join(runsDirectory, runId), { recursive: true });
      await writeFile(path, content);
    });
    return saved instanceof WorkOsError ? saved : undefined;
  };

  return {
    saveStartManifest: async (runId, manifest) => writeRunFile(runId, manifestPath(runId), JSON.stringify(manifest)),
    saveProjectPath: async (runId, projectPath) => writeRunFile(runId, projectPathFile(runId), projectPath),
    readProjectPath: async (runId) => tryCatchAsync(() => readFile(projectPathFile(runId), "utf8")),
    readStartManifest: async (runId) => {
      const text = await tryCatchAsync(() => readFile(manifestPath(runId), "utf8"));
      if (text instanceof WorkOsError) return text;

      return parseManifest(text);
    },
  };
};

const parseManifest = (text: string): FileManifest | WorkOsError => {
  const parsed = tryCatch((): unknown => JSON.parse(text));
  const isManifest = typeof parsed === "object" && parsed !== null && Object.values(parsed).every((value) => typeof value === "string");
  if (!isManifest) return new InvalidRequestError("The stored start manifest is damaged.");

  return Object.fromEntries(Object.entries(parsed).map(([path, hash]) => [path, String(hash)]));
};
