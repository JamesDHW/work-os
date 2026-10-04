import type { RunId } from "@work-os/domain/identifiers/Identifiers";
import type { RunSpec } from "@work-os/domain/runs/RunSpec";
import type { WorkOsError } from "@work-os/shared/WorkOsError";

import type { RunTranscript } from "./RunTranscript.ts";

export type StartConversationInput = {
  readonly runId: RunId;
  readonly spec: RunSpec;
  readonly instructions: string;
  readonly workspacePath: string;
};

export type SubmitMessageInput = {
  readonly conversationId: string;
  readonly text: string;
  readonly mode: "steer" | "followUp";
  readonly requestId: string;
};

export type AgentRuntime = {
  readonly startConversation: (input: StartConversationInput) => Promise<string | WorkOsError>;
  readonly submitMessage: (input: SubmitMessageInput) => Promise<WorkOsError | undefined>;
  readonly readTranscript: (conversationId: string) => Promise<RunTranscript | WorkOsError>;
  readonly stopConversation: (conversationId: string) => Promise<WorkOsError | undefined>;
  readonly watchConversation: (runId: RunId, conversationId: string) => Promise<WorkOsError | undefined>;
};
