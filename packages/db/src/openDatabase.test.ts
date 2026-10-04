import { mkdtemp, rm } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { toInboxItemId, toRunId, toUserId, toWorkspaceId } from "@work-os/domain/identifiers/Identifiers";
import type { InboxItem } from "@work-os/domain/inbox/InboxItem";
import { ConflictError } from "@work-os/shared/ConflictError";
import { WorkOsError } from "@work-os/shared/WorkOsError";

import { createUserStore } from "./identity/createUserStore.ts";
import { createInboxStore } from "./inbox/createInboxStore.ts";
import { openDatabase, type OpenedDatabase } from "./openDatabase.ts";
import { createWorkspaceStore } from "./workspaces/createWorkspaceStore.ts";

const workspaceId = toWorkspaceId("workspace-1");
const userId = toUserId("user-1");
const folder = { path: "" };
const openedDatabases: OpenedDatabase[] = [];

const openTestDatabase = async (): Promise<OpenedDatabase> => {
  const database = await openDatabase(join(folder.path, "work-os.sqlite"));
  if (database instanceof WorkOsError) return expect.unreachable(database.message);
  openedDatabases.push(database);
  return database;
};

const approvalItem: InboxItem = {
  id: toInboxItemId("item-1"),
  workspaceId,
  runId: toRunId("run-1"),
  origin: { kind: "capabilityApproval", taskId: "task-1" },
  title: "Allow github.pr.create?",
  isBlocking: true,
  payload: { kind: "question", question: "Allow?", options: [] },
  state: { status: "open" },
  createdAt: "2026-10-04T10:00:00.000Z",
};

beforeEach(async () => {
  folder.path = await mkdtemp(join(tmpdir(), "work-os-db-"));
});

afterEach(async () => {
  for (const database of openedDatabases.splice(0)) {
    database.close();
  }
  await rm(folder.path, { recursive: true, force: true });
});

describe("openDatabase", () => {
  it("migrates a new file and stores a user with a personal workspace", async () => {
    const { database } = await openTestDatabase();
    const userStore = createUserStore(database);
    const workspaceStore = createWorkspaceStore(database);

    await userStore.createUser({ id: userId, displayName: "Ada", createdAt: "2026-10-04T10:00:00.000Z" });
    await workspaceStore.createWorkspace({ id: workspaceId, name: "Ada's", kind: "personal", createdAt: "2026-10-04T10:00:00.000Z" }, userId);

    expect(await userStore.countUsers()).toBe(1);
    expect(await workspaceStore.listWorkspacesForUser(userId)).toEqual([
      { id: workspaceId, name: "Ada's", kind: "personal", createdAt: "2026-10-04T10:00:00.000Z" },
    ]);
    expect(await workspaceStore.listMemberIds(workspaceId)).toEqual([userId]);
  });

  it("closes an inbox item only once", async () => {
    const inboxStore = createInboxStore((await openTestDatabase()).database);
    await inboxStore.createInboxItem(approvalItem);
    const answered = { status: "answered", answer: { kind: "reply", text: "yes" }, answeredBy: userId, answeredAt: "now" } as const;

    const first = await inboxStore.closeInboxItem(approvalItem.id, answered);
    const second = await inboxStore.closeInboxItem(approvalItem.id, { status: "withdrawn" });

    expect(first).toMatchObject({ state: answered });
    expect(second).toBeInstanceOf(ConflictError);
    expect(await inboxStore.findInboxItemByTask("task-1")).toMatchObject({ id: approvalItem.id, state: answered });
  });
});
