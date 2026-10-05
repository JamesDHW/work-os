import type { FC } from "react";

import type { RunState } from "../../api/apiTypes.ts";
import { ErrorNotice } from "../../ui/ErrorNotice/ErrorNotice.tsx";
import { MutedText } from "../../ui/Heading/Heading.tsx";
import { OUTCOME_LABELS, WAITING_REASON_LABELS } from "../runs.constants.ts";

export type RunStateNoteProps = {
  readonly state: RunState;
};

export const RunStateNote: FC<RunStateNoteProps> = ({ state }) => {
  switch (state.status) {
    case "waiting":
      return <MutedText>{WAITING_REASON_LABELS[state.reason]}</MutedText>;
    case "completed":
      return <MutedText>{OUTCOME_LABELS[state.outcome]}.</MutedText>;
    case "failed":
      return <ErrorNotice message={state.message} />;
    case "preparing":
    case "running":
    case "checking":
    case "reviewing":
    case "stopped":
      return null;
    default:
      return state satisfies never;
  }
};
