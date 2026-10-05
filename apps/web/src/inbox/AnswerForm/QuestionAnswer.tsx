import type { FC } from "react";

import { Button } from "../../ui/Button/Button.tsx";
import { TextArea } from "../../ui/Field/TextArea.tsx";
import { Markdown } from "../../ui/Markdown/Markdown.tsx";
import { Stack } from "../../ui/Stack/Stack.tsx";
import type { AnswerFormModel } from "./AnswerForm.hook.ts";

export type QuestionAnswerProps = {
  readonly model: AnswerFormModel;
  readonly question: string;
  readonly options: readonly string[];
};

export const QuestionAnswer: FC<QuestionAnswerProps> = ({ model, question, options }) => (
  <Stack>
    <Markdown text={question} />
    {options.length > 0 ? (
      <Stack direction="row" gap="sm">
        {options.map((option) => (
          <Button key={option} value={option} disabled={model.isBusy} onClick={model.handleOptionClick}>
            {option}
          </Button>
        ))}
      </Stack>
    ) : null}
    <TextArea value={model.replyText} onChange={model.handleReplyChange} placeholder="Your reply" aria-label="Reply" />
    <Stack direction="row" justify="end">
      <Button tone="primary" disabled={model.isBusy || model.replyText.trim().length === 0} onClick={model.handleReplyClick}>
        Send reply
      </Button>
    </Stack>
  </Stack>
);
