import type { WorkspaceEvent } from "@work-os/domain/events/WorkspaceEvent";
import type { WorkspaceId } from "@work-os/domain/identifiers/Identifiers";

import type { EventBus, Unsubscribe, WorkspaceEventListener } from "./EventBus.ts";

export const createEventBus = (): EventBus => {
  const listenersByWorkspace = new Map<WorkspaceId, Set<WorkspaceEventListener>>();

  const publish = (event: WorkspaceEvent): void => {
    const listeners = listenersByWorkspace.get(event.workspaceId);
    if (listeners === undefined) return;

    for (const listener of listeners) {
      listener(event);
    }
  };

  const listenersFor = (workspaceId: WorkspaceId): Set<WorkspaceEventListener> => {
    const existing = listenersByWorkspace.get(workspaceId);
    if (existing !== undefined) return existing;

    const created = new Set<WorkspaceEventListener>();
    listenersByWorkspace.set(workspaceId, created);
    return created;
  };

  const subscribe = (workspaceId: WorkspaceId, listener: WorkspaceEventListener): Unsubscribe => {
    const listeners = listenersFor(workspaceId);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  };

  return { publish, subscribe };
};
