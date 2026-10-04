import { applyRunEvent } from "@work-os/domain/runs/applyRunEvent";
import type { Run } from "@work-os/domain/runs/Run";
import type { RunEvent } from "@work-os/domain/runs/RunEvent";
import { WorkOsError } from "@work-os/shared/WorkOsError";

import type { EventBus } from "../events/EventBus.ts";
import type { SystemClock } from "../system/SystemClock.ts";
import type { RunChange, RunStore } from "./RunStore.ts";

export type RunTransition = {
  readonly run: Run;
  readonly event: RunEvent;
  readonly change?: Omit<RunChange, "state" | "updatedAt">;
};

type TransitionRunDependencies = {
  readonly runStore: Pick<RunStore, "updateRun">;
  readonly eventBus: Pick<EventBus, "publish">;
  readonly clock: SystemClock;
};

export type TransitionRun = (transition: RunTransition) => Promise<Run | WorkOsError>;

export const createTransitionRun = (dependencies: TransitionRunDependencies): TransitionRun => {
  return async (transition) => {
    const state = applyRunEvent(transition.run.state, transition.event);
    if (state instanceof WorkOsError) return state;

    const updated = await dependencies.runStore.updateRun(transition.run.id, {
      ...transition.change,
      state,
      updatedAt: dependencies.clock.now(),
    });
    if (updated instanceof WorkOsError) return updated;

    dependencies.eventBus.publish({ kind: "runUpdated", workspaceId: updated.workspaceId, runId: updated.id });
    return updated;
  };
};
