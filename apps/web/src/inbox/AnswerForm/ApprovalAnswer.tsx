import type { FC } from "react";

import type { InboxItem } from "../../api/apiTypes.ts";
import { Button } from "../../ui/Button/Button.tsx";
import { Field } from "../../ui/Field/Field.tsx";
import { TextArea } from "../../ui/Field/TextArea.tsx";
import { Stack } from "../../ui/Stack/Stack.tsx";
import { DURATION_LABELS } from "../inbox.constants.ts";
import { argumentList } from "../InboxItemCard/InboxItemCard.css.ts";
import type { AnswerFormModel } from "./AnswerForm.hook.ts";

type ApprovalPayload = Extract<InboxItem["payload"], { readonly kind: "approval" }>;

export type ApprovalAnswerProps = {
  readonly model: AnswerFormModel;
  readonly payload: ApprovalPayload;
};

export const ApprovalAnswer: FC<ApprovalAnswerProps> = ({ model, payload }) => (
  <Stack>
    <span>
      <strong>{payload.capabilityId}</strong> on <strong>{payload.target}</strong>
    </span>
    <pre className={argumentList}>{JSON.stringify(payload.arguments, null, 2)}</pre>
    {payload.editableFields.map((field) => (
      <Field key={field} label={`Edit ${field}`}>
        <TextArea name={field} value={model.editedFields[field] ?? ""} onChange={model.handleFieldChange} />
      </Field>
    ))}
    <TextArea value={model.replyText} onChange={model.handleReplyChange} placeholder="Reason, if you reject" aria-label="Reason" />
    <Stack direction="row" gap="sm">
      {payload.durations.map((duration) => (
        <Button key={duration} value={duration} tone="primary" disabled={model.isBusy} onClick={model.handleApproveClick}>
          {DURATION_LABELS[duration]}
        </Button>
      ))}
      <Button tone="danger" disabled={model.isBusy} onClick={model.handleRejectClick}>
        Reject
      </Button>
    </Stack>
  </Stack>
);
