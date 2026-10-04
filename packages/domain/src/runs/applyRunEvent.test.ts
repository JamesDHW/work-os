import { describe, expect, it } from "vitest";

import { applyRunEvent, InvalidRunTransitionError } from "./applyRunEvent.ts";

describe("applyRunEvent", () => {
  it("starts running when the environment is ready", () => {
    expect(applyRunEvent({ status: "preparing" }, { kind: "environmentReady" })).toEqual({ status: "running" });
  });

  it("goes to review after checks when the standard requires review", () => {
    expect(applyRunEvent({ status: "checking" }, { kind: "checksPassed", isReviewRequired: true })).toEqual({
      status: "reviewing",
    });
  });

  it("completes unreviewed after checks when review is not required", () => {
    expect(applyRunEvent({ status: "checking" }, { kind: "checksPassed", isReviewRequired: false })).toEqual({
      status: "completed",
      outcome: "unreviewed",
    });
  });

  it("returns to running when checks fail", () => {
    expect(applyRunEvent({ status: "checking" }, { kind: "checksFailed" })).toEqual({ status: "running" });
  });

  it("refuses to stop a finished run", () => {
    expect(applyRunEvent({ status: "completed", outcome: "accepted" }, { kind: "stopped" })).toBeInstanceOf(
      InvalidRunTransitionError,
    );
  });

  it("refuses a review decision while the run is still running", () => {
    expect(applyRunEvent({ status: "running" }, { kind: "reviewDecided", outcome: "accepted" })).toBeInstanceOf(
      InvalidRunTransitionError,
    );
  });

  it("reopens a completed run", () => {
    expect(applyRunEvent({ status: "completed", outcome: "unreviewed" }, { kind: "reopened" })).toEqual({
      status: "preparing",
    });
  });

  it("returns a reviewed run to work when the reviewer asks for a revision", () => {
    expect(applyRunEvent({ status: "reviewing" }, { kind: "revisionRequested" })).toEqual({ status: "running" });
  });
});
