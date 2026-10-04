import type { CapabilityId, InboxItemId, RunId, UserId, WorkspaceId } from "../identifiers/Identifiers.ts";
import type { GrantDuration } from "../capabilities/Grant.ts";
import type { JsonObject } from "../json/Json.ts";
import type { InboxAnswer } from "./InboxAnswer.ts";

export type InboxPayload =
  | { readonly kind: "question"; readonly question: string; readonly options: readonly string[] }
  | {
      readonly kind: "approval";
      readonly capabilityId: CapabilityId;
      readonly target: string;
      readonly arguments: JsonObject;
      readonly editableFields: readonly string[];
      readonly durations: readonly GrantDuration[];
    }
  | { readonly kind: "review"; readonly summary: string; readonly changedFileCount: number }
  | { readonly kind: "escalation"; readonly reason: string };

export type InboxItemKind = InboxPayload["kind"];

export type InboxItemState =
  | { readonly status: "open" }
  | {
      readonly status: "answered";
      readonly answer: InboxAnswer;
      readonly answeredBy: UserId;
      readonly answeredAt: string;
    }
  | { readonly status: "withdrawn" };

export type InboxItem = {
  readonly id: InboxItemId;
  readonly workspaceId: WorkspaceId;
  readonly runId: RunId | undefined;
  readonly title: string;
  readonly isBlocking: boolean;
  readonly payload: InboxPayload;
  readonly state: InboxItemState;
  readonly createdAt: string;
};
