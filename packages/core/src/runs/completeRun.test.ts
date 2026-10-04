import { describe, expect, it } from "vitest";

import { toAgentId, toEnvironmentId, toInboxItemId, toProjectId, toRunId } from "@work-os/domain/identifiers/Identifiers";
import { toRunnerId, toStandardId, toUserId, toWorkspaceId } from "@work-os/domain/identifiers/Identifiers";
import type { RunnerRequest } from "@work-os/domain/runners/RunnerRequest";
import type { RunnerResult } from "@work-os/domain/runners/RunnerResult";
import type { InboxItem } from "@work-os/domain/inbox/InboxItem";
import type { Run } from "@work-os/domain/runs/Run";
import type { ReviewPolicy } from "@work-os/domain/standards/Standard";

import type { OpenInboxItemInput } from "../inbox/openInboxItem.ts";
import { createRunnerHub } from "../runners/createRunnerHub.ts";
import { createCompleteRun } from "./completeRun.ts";
import { createFinishCheckedRun } from "./finishCheckedRun.ts";
import { createHandleCheckFailures } from "./handleCheckFailures.ts";
import { createRunChecks } from "./runChecks.ts";
import type { RunChange } from "./RunStore.ts";
import { createTransitionRun } from "./transitionRun.ts";

const createRun = (review: ReviewPolicy): Run => ({
  id: toRunId("run-1"),
  workspaceId: toWorkspaceId("workspace-1"),
  projectId: toProjectId("project-1"),
  standardId: toStandardId("fix-bug"),
  principal: { kind: "user", userId: toUserId("user-1") },
  spec: {
    runId: toRunId("run-1"),
    prompt: "Fix the login bug",
    project: { id: toProjectId("project-1"), runnerId: toRunnerId("runner-1"), path: "/work/app" },
    standard: {
      id: toStandardId("fix-bug"),
      packageRevision: "abc",
      criteria: "",
      method: "",
      checks: [{ name: "tests", command: "npm test" }],
      review,
    },
    agent: { id: toAgentId("default"), model: { provider: "faux", modelId: "scripted" }, thinkingLevel: "medium", instructions: "" },
    skills: [],
    capabilities: [],
    environment: { id: toEnvironmentId("default"), devcontainer: {}, egress: [] },
  },
  addedCapabilities: [],
  state: { status: "running" },
  summary: null,
  outputs: null,
  conversationId: "conversation-1",
  createdAt: "2026-10-04T10:00:00.000Z",
  updatedAt: "2026-10-04T10:00:00.000Z",
});

const createAnsweringGateway = (answer: (request: RunnerRequest) => RunnerResult) => {
  const requestIds = [1, 2, 3, 4, 5, 6].map((index) => `request-${index}`);
  const runnerHub = createRunnerHub({ randomSource: { createId: () => requestIds.shift() ?? "request-overflow" } });
  runnerHub.attach(toRunnerId("runner-1"), {
    send: (message) => runnerHub.receive({ type: "succeeded", requestId: message.requestId, result: answer(message.request) }),
  });
  return runnerHub;
};

const answerRequest = (request: RunnerRequest, checkExitCode: number): RunnerResult => {
  if (request.kind === "collectChanges") return { kind: "collectChanges", changedFiles: [{ path: "src/login.ts", change: "modified" }], diff: null };

  return { kind: "exec", exitCode: checkExitCode, output: "1 failing test", isTimedOut: false };
};

const createHarness = (review: ReviewPolicy, checkExitCode: number) => {
  const stored = { run: createRun(review) };
  const openedItems: OpenInboxItemInput[] = [];
  const stoppedRuns: string[] = [];
  const clock = { now: () => "2026-10-04T10:05:00.000Z" };
  const logger = { info: () => undefined, warn: () => undefined, error: () => undefined };
  const runStore = {
    findRun: async () => stored.run,
    updateRun: async (_runId: Run["id"], change: RunChange) => {
      stored.run = { ...stored.run, ...change };
      return stored.run;
    },
  };
  const runnerGateway = createAnsweringGateway((request) => answerRequest(request, checkExitCode));
  const transitionRun = createTransitionRun({ runStore, eventBus: { publish: () => undefined }, clock });
  const openInboxItem = async (input: OpenInboxItemInput): Promise<InboxItem> => {
    openedItems.push(input);
    return { ...input, id: toInboxItemId("item-1"), state: { status: "open" }, createdAt: clock.now() };
  };
  const stopRunEnvironment = async (run: Run) => (stoppedRuns.push(run.id), undefined);
  const completeRun = createCompleteRun({
    runStore,
    transitionRun,
    runChecks: createRunChecks({ runnerGateway }),
    handleCheckFailures: createHandleCheckFailures({
      observationStore: { countObservations: async () => 1 },
      recordObservation: async () => undefined,
      transitionRun,
      openInboxItem,
      stopRunEnvironment,
    }),
    finishCheckedRun: createFinishCheckedRun({ runnerGateway, transitionRun, openInboxItem, stopRunEnvironment, logger }),
  });
  return { completeRun, stored, openedItems, stoppedRuns };
};

describe("completeRun", () => {
  it("returns failing checks to the agent and keeps the run working", async () => {
    const { completeRun, stored } = createHarness("required", 1);

    const result = await completeRun({ runId: toRunId("run-1"), summary: "Fixed it" });

    expect(result).toMatchObject({ isFinished: false });
    expect(JSON.stringify(result)).toContain("1 failing test");
    expect(stored.run.state).toEqual({ status: "running" });
  });

  it("opens a blocking review when checks pass and review is required", async () => {
    const { completeRun, stored, openedItems } = createHarness("required", 0);

    const result = await completeRun({ runId: toRunId("run-1"), summary: "Fixed it" });

    expect(result).toMatchObject({ isFinished: true });
    expect(stored.run.state).toEqual({ status: "reviewing" });
    expect(stored.run.outputs?.changedFiles).toEqual([{ path: "src/login.ts", change: "modified" }]);
    expect(openedItems[0]).toMatchObject({ isBlocking: true, payload: { kind: "review", summary: "Fixed it", changedFileCount: 1 } });
  });

  it("completes without review and stops the environment when the standard needs none", async () => {
    const { completeRun, stored, stoppedRuns } = createHarness("none", 0);

    await completeRun({ runId: toRunId("run-1"), summary: "Fixed it" });

    expect(stored.run.state).toEqual({ status: "completed", outcome: "unreviewed" });
    expect(stoppedRuns).toEqual(["run-1"]);
  });
});
