import type { GrantDuration } from "../capabilities/Grant.ts";
import type { JsonObject } from "../json/Json.ts";

export type InboxAnswer =
  | { readonly kind: "reply"; readonly text: string }
  | { readonly kind: "approve"; readonly duration: GrantDuration; readonly editedArguments?: JsonObject }
  | { readonly kind: "reject"; readonly reason?: string }
  | { readonly kind: "accept" }
  | { readonly kind: "requestRevision"; readonly comment: string }
  | { readonly kind: "acknowledge" };

export type InboxAnswerKind = InboxAnswer["kind"];
