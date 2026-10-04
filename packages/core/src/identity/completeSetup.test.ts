import { describe, expect, it } from "vitest";

import { toWorkspaceId } from "@work-os/domain/identifiers/Identifiers";
import { ConflictError } from "@work-os/shared/ConflictError";
import { ForbiddenError } from "@work-os/shared/ForbiddenError";

import { createCompleteSetup } from "./completeSetup.ts";

const createSetup = (userCount: number) => {
  return createCompleteSetup({
    readSetupCode: () => "SETUP-CODE",
    userStore: { countUsers: async () => userCount, createUser: async (user) => user },
    createPersonalWorkspace: async (owner) => ({
      id: toWorkspaceId("workspace-1"),
      name: `${owner.displayName}'s workspace`,
      kind: "personal",
      createdAt: owner.createdAt,
    }),
    issueSession: async () => "session-token",
    randomSource: { createId: () => "user-1" },
    clock: { now: () => "2026-10-04T10:00:00.000Z" },
  });
};

describe("completeSetup", () => {
  it("creates the first user, a personal workspace and a session", async () => {
    const completed = await createSetup(0)({ setupCode: "SETUP-CODE", displayName: "Ada" });

    expect(completed).toMatchObject({ user: { displayName: "Ada" }, workspace: { kind: "personal" }, token: "session-token" });
  });

  it("refuses a wrong setup code", async () => {
    expect(await createSetup(0)({ setupCode: "GUESS", displayName: "Ada" })).toBeInstanceOf(ForbiddenError);
  });

  it("refuses to set up twice", async () => {
    expect(await createSetup(1)({ setupCode: "SETUP-CODE", displayName: "Ada" })).toBeInstanceOf(ConflictError);
  });
});
