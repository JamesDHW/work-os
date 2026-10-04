import type { WorkspaceEvent } from "@work-os/domain/events/WorkspaceEvent";
import type { WorkspaceId } from "@work-os/domain/identifiers/Identifiers";

export type WorkspaceEventListener = (event: WorkspaceEvent) => void;
export type Unsubscribe = () => void;

export type EventBus = {
  readonly publish: (event: WorkspaceEvent) => void;
  readonly subscribe: (workspaceId: WorkspaceId, listener: WorkspaceEventListener) => Unsubscribe;
};
