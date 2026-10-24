import type { WorkspaceId } from "@work-os/domain/identifiers/Identifiers";
import { NotFoundError } from "@work-os/shared/NotFoundError";
import { WorkOsError } from "@work-os/shared/WorkOsError";

import type { WorkspacePackages } from "../catalogue/WorkspacePackages.ts";
import { DEFAULT_MODEL_ALIAS } from "./models.constants.ts";

type ReadDefaultModelDependencies = {
  readonly workspacePackages: Pick<WorkspacePackages, "readModelAliases">;
};

export type ReadDefaultModel = (workspaceId: WorkspaceId) => Promise<string | WorkOsError>;

export const createReadDefaultModel = (dependencies: ReadDefaultModelDependencies): ReadDefaultModel => {
  return async (workspaceId) => {
    const aliases = await dependencies.workspacePackages.readModelAliases(workspaceId);
    if (aliases instanceof WorkOsError) return aliases;

    const model = aliases[DEFAULT_MODEL_ALIAS];
    if (model === undefined) return new NotFoundError("The workspace package sets no default model.");
    return model;
  };
};
