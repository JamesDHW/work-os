import { describe, expect, it } from "vitest";

import { toCapabilityId, toInboxItemId, toUserId, toWorkspaceId } from "../identifiers/Identifiers.ts";
import type { InboxItem, InboxPayload } from "./InboxItem.ts";
import { rankInboxItems } from "./rankInboxItems.ts";
import { InboxAnswerMismatchError, InboxItemClosedError, validateInboxAnswer } from "./validateInboxAnswer.ts";

const approvalPayload: InboxPayload = {
  kind: "approval",
  capabilityId: toCapabilityId("github.pr.create"),
  target: "acme/app",
  arguments: { title: "Fix login", body: "…" },
  editableFields: ["title", "body"],
  durations: ["once", "run", "standard"],
};

const createItem = (id: string, payload: InboxPayload, overrides: Partial<InboxItem> = {}): InboxItem => ({
  id: toInboxItemId(id),
  workspaceId: toWorkspaceId("workspace-1"),
  runId: null,
  origin: { kind: "runInput" },
  title: id,
  isBlocking: true,
  payload,
  state: { status: "open" },
  createdAt: "2026-10-04T10:00:00.000Z",
  ...overrides,
});

describe("validateInboxAnswer", () => {
  it("accepts an approval with an offered duration and editable fields", () => {
    const answer = { kind: "approve", duration: "run", editedArguments: { title: "Fix the login" } } as const;
    expect(validateInboxAnswer(createItem("a", approvalPayload), answer)).toEqual(answer);
  });

  it("rejects edits to fields that are not editable", () => {
    const answer = { kind: "approve", duration: "once", editedArguments: { repository: "acme/other" } } as const;
    expect(validateInboxAnswer(createItem("a", approvalPayload), answer)).toBeInstanceOf(InboxAnswerMismatchError);
  });

  it("rejects a reply to an approval", () => {
    expect(validateInboxAnswer(createItem("a", approvalPayload), { kind: "reply", text: "ok" })).toBeInstanceOf(
      InboxAnswerMismatchError,
    );
  });

  it("rejects an answer to an item that is already answered", () => {
    const answered = createItem("a", approvalPayload, {
      state: {
        status: "answered",
        answer: { kind: "reject" },
        answeredBy: toUserId("user-1"),
        answeredAt: "2026-10-04T10:01:00.000Z",
      },
    });
    expect(validateInboxAnswer(answered, { kind: "reject" })).toBeInstanceOf(InboxItemClosedError);
  });
});

describe("rankInboxItems", () => {
  it("puts blocking items first, then approvals, then oldest first", () => {
    const review = createItem("review", { kind: "review", summary: "Done", changedFileCount: 2 }, { isBlocking: false });
    const question = createItem("question", { kind: "question", question: "Which repo?", options: [] });
    const olderApproval = createItem("older", approvalPayload, { createdAt: "2026-10-04T09:00:00.000Z" });
    const newerApproval = createItem("newer", approvalPayload);

    const ranked = rankInboxItems([review, question, newerApproval, olderApproval]);
    expect(ranked.map((inboxItem) => inboxItem.id)).toEqual(["older", "newer", "question", "review"]);
  });
});
