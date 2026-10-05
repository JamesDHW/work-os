import type { FC } from "react";

import type { InboxItem } from "../../api/apiTypes.ts";
import { Button } from "../../ui/Button/Button.tsx";
import { ErrorNotice } from "../../ui/ErrorNotice/ErrorNotice.tsx";
import { Markdown } from "../../ui/Markdown/Markdown.tsx";
import { Stack } from "../../ui/Stack/Stack.tsx";
import { ApprovalAnswer } from "./ApprovalAnswer.tsx";
import { useAnswerForm, type AnswerFormModel } from "./AnswerForm.hook.ts";
import { QuestionAnswer } from "./QuestionAnswer.tsx";
import { ReviewAnswer } from "./ReviewAnswer.tsx";

export type AnswerFormProps = {
  readonly workspaceId: string;
  readonly inboxItem: InboxItem;
};

export const AnswerForm: FC<AnswerFormProps> = (props) => {
  const model = useAnswerForm(props.workspaceId, props.inboxItem);
  const { payload } = props.inboxItem;

  return (
    <Stack>
      <AnswerControls model={model} payload={payload} />
      <ErrorNotice message={model.errorMessage} />
    </Stack>
  );
};

type AnswerControlsProps = {
  readonly model: AnswerFormModel;
  readonly payload: InboxItem["payload"];
};

const AnswerControls: FC<AnswerControlsProps> = ({ model, payload }) => {
  switch (payload.kind) {
    case "question":
      return <QuestionAnswer model={model} question={payload.question} options={payload.options} />;
    case "approval":
      return <ApprovalAnswer model={model} payload={payload} />;
    case "review":
      return <ReviewAnswer model={model} summary={payload.summary} changedFileCount={payload.changedFileCount} />;
    case "escalation":
      return (
        <Stack>
          <Markdown text={payload.reason} />
          <Button disabled={model.isBusy} onClick={model.handleAcknowledgeClick}>
            Acknowledge
          </Button>
        </Stack>
      );
    default:
      return payload satisfies never;
  }
};
