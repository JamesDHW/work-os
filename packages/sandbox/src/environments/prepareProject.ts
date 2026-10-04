import type { RunnerRequest } from "@work-os/domain/runners/RunnerRequest";
import type { RunnerResult } from "@work-os/domain/runners/RunnerResult";
import { WorkOsError } from "@work-os/shared/WorkOsError";

import type { ManifestStore } from "../outputs/createManifestStore.ts";
import { hashFolder } from "../outputs/hashFolder.ts";
import type { EnvironmentDriver } from "./EnvironmentDriver.ts";
import { requireProjectFolder } from "./requireProjectFolder.ts";

type PrepareRequest = Extract<RunnerRequest, { readonly kind: "prepareEnvironment" }>;

export type PrepareParts = {
  readonly driver: EnvironmentDriver;
  readonly manifestStore: ManifestStore;
};

export const prepareProject = async (parts: PrepareParts, request: PrepareRequest): Promise<RunnerResult | WorkOsError> => {
  const projectPath = await requireProjectFolder(request.projectPath);
  if (projectPath instanceof WorkOsError) return projectPath;

  const recorded = await recordStartState(parts.manifestStore, request, projectPath);
  if (recorded instanceof WorkOsError) return recorded;

  const workspacePath = await parts.driver.prepare({ ...request, projectPath });
  if (workspacePath instanceof WorkOsError) return workspacePath;
  return { kind: "prepareEnvironment", workspacePath };
};

const recordStartState = async (manifestStore: ManifestStore, request: PrepareRequest, projectPath: string): Promise<WorkOsError | undefined> => {
  const savedPath = await manifestStore.saveProjectPath(request.runId, projectPath);
  if (savedPath instanceof WorkOsError) return savedPath;

  const existing = await manifestStore.readStartManifest(request.runId);
  if (!(existing instanceof WorkOsError)) return undefined;

  const manifest = await hashFolder(projectPath);
  if (manifest instanceof WorkOsError) return manifest;
  return manifestStore.saveStartManifest(request.runId, manifest);
};
