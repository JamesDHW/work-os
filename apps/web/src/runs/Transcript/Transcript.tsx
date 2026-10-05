import type { FC } from "react";

import type { TranscriptEntry } from "../../api/apiTypes.ts";
import { EmptyState } from "../../ui/EmptyState/EmptyState.tsx";
import { Markdown } from "../../ui/Markdown/Markdown.tsx";
import { entryRecipe, toolOutput, toolPreview, toolSummary, transcript } from "./Transcript.css.ts";
import { toToolPreview } from "./toToolPreview.ts";

export type TranscriptProps = {
  readonly entries: readonly TranscriptEntry[];
  readonly streamingText: string | null;
};

export const Transcript: FC<TranscriptProps> = (props) => {
  const isEmpty = props.entries.length === 0 && props.streamingText === null;
  if (isEmpty) return <EmptyState>The agent has not said anything yet.</EmptyState>;

  return (
    <ol className={transcript}>
      {props.entries.map((entry) => (
        <li key={entry.id} className={entryRecipe({ role: entry.role, isError: entry.isError })}>
          <TranscriptText entry={entry} />
        </li>
      ))}
      {props.streamingText === null ? null : (
        <li className={entryRecipe({ role: "assistant", isError: false })}>
          <Markdown text={props.streamingText} />
        </li>
      )}
    </ol>
  );
};

type TranscriptTextProps = {
  readonly entry: TranscriptEntry;
};

const TranscriptText: FC<TranscriptTextProps> = ({ entry }) => {
  if (entry.role !== "tool") return <Markdown text={entry.text} />;

  return (
    <details>
      <summary className={toolSummary}>
        {entry.toolName ?? "tool"} <span className={toolPreview}>{toToolPreview(entry.text)}</span>
      </summary>
      <pre className={toolOutput}>{entry.text}</pre>
    </details>
  );
};
