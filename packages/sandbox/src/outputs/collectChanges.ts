import type { RunId } from "@work-os/domain/identifiers/Identifiers";
import { diffManifests } from "@work-os/domain/runs/diffManifests";
import type { RunnerResult } from "@work-os/domain/runners/RunnerResult";
import { WorkOsError } from "@work-os/shared/WorkOsError";

import { runGitIn } from "../hostCommands/runGitIn.ts";
import type { ManifestStore } from "./createManifestStore.ts";
import { hashFolder } from "./hashFolder.ts";

export type ChangesRequest = {
  readonly runId: RunId;
  readonly projectPath: string;
};

export type CollectedChanges = Extract<RunnerResult, { readonly kind: "collectChanges" }>;

export const collectChanges = async (manifestStore: ManifestStore, request: ChangesRequest): Promise<CollectedChanges | WorkOsError> => {
  const [startManifest, endManifest] = await Promise.all([manifestStore.readStartManifest(request.runId), hashFolder(request.projectPath)]);
  if (startManifest instanceof WorkOsError) return startManifest;
  if (endManifest instanceof WorkOsError) return endManifest;

  const changedFiles = diffManifests(startManifest, endManifest);
  const diff = await readGitDiff(request.projectPath, changedFiles.map((file) => file.path));
  return { kind: "collectChanges", changedFiles, diff };
};

const readGitDiff = async (projectPath: string, paths: readonly string[]): Promise<string | null> => {
  if (paths.length === 0) return null;

  const outcome = await runGitIn(projectPath, ["diff", "--no-color", "HEAD", "--", ...paths]);
  const hasDiff = !(outcome instanceof WorkOsError) && outcome.exitCode === 0 && outcome.output.length > 0;
  return hasDiff ? outcome.output : null;
};
