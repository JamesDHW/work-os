import { describe, expect, it } from "vitest";

import type { CapabilityDefinition } from "@work-os/domain/capabilities/CapabilityDefinition";
import type { Grant } from "@work-os/domain/capabilities/Grant";
import { toAgentId, toCapabilityId, toEnvironmentId, toInboxItemId } from "@work-os/domain/identifiers/Identifiers";
import { toProjectId, toRunId, toRunnerId, toStandardId, toUserId, toWorkspaceId } from "@work-os/domain/identifiers/Identifiers";
import type { InboxAnswer } from "@work-os/domain/inbox/InboxAnswer";
import type { InboxItem } from "@work-os/domain/inbox/InboxItem";
import type { Project } from "@work-os/domain/projects/Project";
import type { Run } from "@work-os/domain/runs/Run";
import { ConflictError } from "@work-os/shared/ConflictError";

import { createInboxWaiters } from "../inbox/inboxWaiters.state.ts";
import type { InboxStore } from "../inbox/InboxStore.ts";
import { createOpenInboxItem } from "../inbox/openInboxItem.ts";
import { createAwaitRunDecision } from "../runs/awaitRunDecision.ts";
import { createCallCapability } from "./callCapability.ts";
import type { CapabilityCallRecord } from "./CapabilityCallStore.ts";
import type { CapabilityExecution } from "./CapabilityRegistry.ts";
import { createExecuteCapability } from "./executeCapability.ts";
import { createRecordGrant } from "./recordGrant.ts";
import { createSeekCapabilityApproval } from "./seekCapabilityApproval.ts";

const workspaceId = toWorkspaceId("workspace-1");
const createPullRequest = toCapabilityId("github.pr.create");
const readIssue = toCapabilityId("github.issue.read");

const run: Run = {
  id: toRunId("run-1"),
  workspaceId,
  projectId: toProjectId("project-1"),
  standardId: toStandardId("fix-bug"),
  principal: { kind: "user", userId: toUserId("user-1") },
  spec: {
    runId: toRunId("run-1"),
    prompt: "Fix the login bug",
    project: { id: toProjectId("project-1"), runnerId: toRunnerId("runner-1"), path: "/work/app" },
    standard: { id: toStandardId("fix-bug"), packageRevision: "abc", criteria: "", method: "", checks: [], review: "required" },
    agent: { id: toAgentId("default"), model: { provider: "faux", modelId: "scripted" }, thinkingLevel: "medium", instructions: "" },
    skills: [],
    capabilities: [createPullRequest, readIssue],
    environment: { id: toEnvironmentId("default"), devcontainer: {}, egress: [] },
  },
  addedCapabilities: [],
  state: { status: "running" },
  summary: null,
  outputs: null,
  conversationId: "conversation-1",
  createdAt: "2026-10-04T10:00:00.000Z",
  updatedAt: "2026-10-04T10:00:00.000Z",
};

const project: Project = {
  id: run.projectId,
  workspaceId,
  name: "App",
  location: { runnerId: toRunnerId("runner-1"), path: "/work/app" },
  environmentId: toEnvironmentId("default"),
  connectionIds: [],
  createdAt: run.createdAt,
};

const definitionFor = (id: typeof createPullRequest, effect: CapabilityDefinition["effect"]): CapabilityDefinition => ({
  id,
  connectionKind: "github",
  description: "",
  effect,
  executionSite: "server",
  editableFields: ["title"],
});

const createHarness = (grants: readonly Grant[] = []) => {
  const inboxItems = new Map<string, InboxItem>();
  const executions: CapabilityExecution[] = [];
  const callRecords = new Map<string, CapabilityCallRecord>();
  const inboxWaiters = createInboxWaiters();
  const clock = { now: () => "2026-10-04T10:05:00.000Z" };
  const randomSource = { createId: () => `id-${inboxItems.size + 1}` };
  const runStore = { findRun: async () => run };
  const inboxStore: Pick<InboxStore, "createInboxItem" | "findInboxItemByTask" | "listOpenRunItems"> = {
    createInboxItem: async (inboxItem) => {
      inboxItems.set(inboxItem.id, inboxItem);
      return inboxItem;
    },
    findInboxItemByTask: async () => null,
    listOpenRunItems: async () => [...inboxItems.values()].filter((inboxItem) => inboxItem.state.status === "open"),
  };
  const transitionRun = async () => run;
  const recordObservation = async () => undefined;
  const openInboxItem = createOpenInboxItem({
    inboxStore,
    eventBus: { publish: () => undefined },
    notifyBlockingItem: async () => undefined,
    randomSource,
    clock,
  });
  const awaitRunDecision = createAwaitRunDecision({ inboxStore, inboxWaiters, openInboxItem, runStore, transitionRun });
  const seekCapabilityApproval = createSeekCapabilityApproval({
    awaitRunDecision,
    recordObservation,
    recordGrant: createRecordGrant({ grantStore: { createGrant: async (grant) => grant }, randomSource, clock }),
  });
  const executeCapability = createExecuteCapability({
    projectStore: { findProject: async () => project },
    findConnectionSecret: async () => "secret-token",
    runnerGateway: { request: async () => new ConflictError("no host commands in this test") },
    capabilityCallStore: { saveCapabilityCall: async (record) => (callRecords.set(record.id, record), record) },
    clock,
  });
  const callCapability = createCallCapability({
    runStore,
    capabilityRegistry: {
      findCapability: async (_workspaceId, capabilityId) => ({
        definition: definitionFor(capabilityId, capabilityId === readIssue ? "read" : "reversible"),
        execute: async (execution) => (executions.push(execution), `done with ${String(execution.arguments["title"])}`),
      }),
    },
    capabilityCallStore: { findCapabilityCall: async (id) => callRecords.get(id) ?? null },
    grantStore: { listGrants: async () => grants },
    seekCapabilityApproval,
    executeCapability,
    recordObservation,
  });
  return { callCapability, inboxItems, inboxWaiters, executions };
};

const settleFirstInboxItem = async (inboxWaiters: ReturnType<typeof createInboxWaiters>, answer: InboxAnswer): Promise<undefined> => {
  await new Promise((resolve) => setTimeout(resolve, 0));
  inboxWaiters.settle(toInboxItemId("id-1"), { status: "answered", answer, answeredBy: toUserId("user-1"), answeredAt: "now" });
  return undefined;
};

describe("callCapability", () => {
  it("runs a read capability without asking", async () => {
    const { callCapability, inboxItems } = createHarness();

    const result = await callCapability({ runId: run.id, taskId: "task-1", capabilityId: readIssue, target: "acme/app", arguments: { title: "x" } });

    expect(result).toBe("done with x");
    expect(inboxItems.size).toBe(0);
  });

  it("asks for approval and runs with the edited arguments", async () => {
    const { callCapability, inboxWaiters, executions } = createHarness();

    const pending = callCapability({ runId: run.id, taskId: "task-1", capabilityId: createPullRequest, target: "acme/app", arguments: { title: "Draft" } });
    await settleFirstInboxItem(inboxWaiters, { kind: "approve", duration: "once", editedArguments: { title: "Fix login" } });

    expect(await pending).toBe("done with Fix login");
    expect(executions[0]?.secret).toBe("secret-token");
  });

  it("returns a refusal when the user rejects", async () => {
    const { callCapability, inboxWaiters, executions } = createHarness();

    const pending = callCapability({ runId: run.id, taskId: "task-1", capabilityId: createPullRequest, target: "acme/app", arguments: {} });
    await settleFirstInboxItem(inboxWaiters, { kind: "reject", reason: "Not yet." });

    expect(await pending).toBe("The user did not allow github.pr.create. Not yet.");
    expect(executions).toEqual([]);
  });

  it("refuses a capability the run does not declare", async () => {
    const { callCapability } = createHarness();

    const result = await callCapability({ runId: run.id, taskId: "task-1", capabilityId: toCapabilityId("git.push"), target: "origin", arguments: {} });

    expect(result).toContain("is not declared for this run");
  });
});
