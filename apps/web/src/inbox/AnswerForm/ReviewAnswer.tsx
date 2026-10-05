import type { FC } from "react";

import { Button } from "../../ui/Button/Button.tsx";
import { TextArea } from "../../ui/Field/TextArea.tsx";
import { MutedText } from "../../ui/Heading/Heading.tsx";
import { Markdown } from "../../ui/Markdown/Markdown.tsx";
import { Stack } from "../../ui/Stack/Stack.tsx";
import type { AnswerFormModel } from "./AnswerForm.hook.ts";

export type ReviewAnswerProps = {
  readonly model: AnswerFormModel;
  readonly summary: string;
  readonly changedFileCount: number;
};

export const ReviewAnswer: FC<ReviewAnswerProps> = ({ model, summary, changedFileCount }) => (
  <Stack>
    <Markdown text={summary} />
    <MutedText>{changedFileCount === 1 ? "1 file changed." : `${changedFileCount} files changed.`} Open the run to see them.</MutedText>
    <TextArea value={model.replyText} onChange={model.handleReplyChange} placeholder="What should change? (for a revision or a rejection)" aria-label="Review comment" />
    <Stack direction="row" gap="sm">
      <Button tone="primary" disabled={model.isBusy} onClick={model.handleAcceptClick}>
        Accept
      </Button>
      <Button disabled={model.isBusy || model.replyText.trim().length === 0} onClick={model.handleRequestRevisionClick}>
        Request changes
      </Button>
      <Button tone="danger" disabled={model.isBusy} onClick={model.handleRejectClick}>
        Reject
      </Button>
    </Stack>
  </Stack>
);
