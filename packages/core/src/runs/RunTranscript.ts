export type TranscriptRole = "user" | "assistant" | "tool";

export type TranscriptEntry = {
  readonly id: string;
  readonly role: TranscriptRole;
  readonly text: string;
  readonly toolName: string | null;
  readonly isError: boolean;
};

export type RunTranscript = {
  readonly entries: readonly TranscriptEntry[];
  readonly streamingText: string | null;
};
