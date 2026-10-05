import type { FC } from "react";

import { Button } from "../../ui/Button/Button.tsx";
import { ErrorNotice } from "../../ui/ErrorNotice/ErrorNotice.tsx";
import { TextArea } from "../../ui/Field/TextArea.tsx";
import { Stack } from "../../ui/Stack/Stack.tsx";
import { MESSAGE_MODE_LABELS } from "../runs.constants.ts";
import { useMessageBox } from "./MessageBox.hook.ts";

export type MessageBoxProps = {
  readonly workspaceId: string;
  readonly runId: string;
  readonly isAgentWorking: boolean;
  readonly isFinished: boolean;
};

export const MessageBox: FC<MessageBoxProps> = ({ workspaceId, runId, isFinished, isAgentWorking }) => {
  const model = useMessageBox(workspaceId, runId);
  const canSend = !model.isBusy && model.text.trim().length > 0;
  const sendLabel = isFinished ? "Reopen with this message" : "Send";

  return (
    <Stack gap="sm">
      <TextArea value={model.text} onChange={model.handleTextChange} placeholder="Message the agent" aria-label="Message" />
      <ErrorNotice message={model.errorMessage} />
      <Stack direction="row" gap="sm" justify="end">
        {isAgentWorking ? (
          <Button disabled={!canSend} onClick={model.handleSteerClick}>
            {MESSAGE_MODE_LABELS.steer}
          </Button>
        ) : null}
        <Button tone="primary" disabled={!canSend} onClick={model.handleFollowUpClick}>
          {isAgentWorking ? MESSAGE_MODE_LABELS.followUp : sendLabel}
        </Button>
      </Stack>
    </Stack>
  );
};
