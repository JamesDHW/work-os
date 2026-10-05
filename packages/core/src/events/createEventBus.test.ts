import { describe, expect, it } from "vitest";

import type { WorkspaceEvent } from "@work-os/domain/events/WorkspaceEvent";
import { toWorkspaceId } from "@work-os/domain/identifiers/Identifiers";

import { createEventBus } from "./eventBus.state.ts";

const workspaceId = toWorkspaceId("workspace-1");

describe("createEventBus", () => {
  it("delivers events only to listeners of the same workspace", () => {
    const eventBus = createEventBus();
    const received: WorkspaceEvent[] = [];
    eventBus.subscribe(workspaceId, (event) => received.push(event));
    eventBus.subscribe(toWorkspaceId("workspace-2"), (event) => received.push(event));

    eventBus.publish({ kind: "inboxUpdated", workspaceId });

    expect(received).toEqual([{ kind: "inboxUpdated", workspaceId }]);
  });

  it("stops delivering after unsubscribe", () => {
    const eventBus = createEventBus();
    const received: WorkspaceEvent[] = [];
    const unsubscribe = eventBus.subscribe(workspaceId, (event) => received.push(event));

    unsubscribe();
    eventBus.publish({ kind: "inboxUpdated", workspaceId });

    expect(received).toEqual([]);
  });
});
