import type { WorkspaceId } from "@work-os/domain/identifiers/Identifiers";
import type { Standard } from "@work-os/domain/standards/Standard";
import { InvalidRequestError } from "@work-os/shared/InvalidRequestError";
import { WorkOsError } from "@work-os/shared/WorkOsError";

import type { EventBus } from "../events/EventBus.ts";
import type { WorkspacePackages } from "./WorkspacePackages.ts";

export type SaveStandardInput = {
  readonly workspaceId: WorkspaceId;
  readonly standard: Standard;
};

type SaveStandardDependencies = {
  readonly workspacePackages: Pick<WorkspacePackages, "readAgent" | "saveStandard">;
  readonly eventBus: Pick<EventBus, "publish">;
};

export type SaveStandard = (input: SaveStandardInput) => Promise<Standard | WorkOsError>;

export const createSaveStandard = (dependencies: SaveStandardDependencies): SaveStandard => {
  return async (input) => {
    const agent = await dependencies.workspacePackages.readAgent(input.workspaceId, input.standard.agentId);
    if (agent instanceof WorkOsError) return new InvalidRequestError(`Agent "${input.standard.agentId}" does not exist.`, { cause: agent });

    const saved = await dependencies.workspacePackages.saveStandard(input.workspaceId, input.standard);
    if (saved instanceof WorkOsError) return saved;

    dependencies.eventBus.publish({ kind: "catalogueUpdated", workspaceId: input.workspaceId });
    return saved;
  };
};
