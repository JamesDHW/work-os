import { useRouter } from "@tanstack/react-router";
import { useState, type ChangeEvent } from "react";

import { apiClient } from "../../api/client.ts";
import { describeFailure } from "../../api/describeFailure.ts";
import { startAction } from "../../api/startAction.ts";

export type MessageMode = "followUp" | "steer";

export type MessageBoxModel = {
  readonly text: string;
  readonly errorMessage: string | null;
  readonly isBusy: boolean;
  readonly handleTextChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
  readonly handleSteerClick: () => void;
  readonly handleFollowUpClick: () => void;
};

export const useMessageBox = (workspaceId: string, runId: string): MessageBoxModel => {
  const router = useRouter();
  const [text, setText] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  const send = async (mode: MessageMode): Promise<void> => {
    setIsBusy(true);
    const params = { path: { workspaceId, runId } };
    const result = await apiClient.POST("/api/w/{workspaceId}/runs/{runId}/messages", { params, body: { text, mode } });
    setIsBusy(false);
    const failure = describeFailure(result);
    setErrorMessage(failure);
    if (failure === null) {
      setText("");
    }
    await router.invalidate();
  };

  return {
    text,
    errorMessage,
    isBusy,
    handleTextChange: (event) => setText(event.target.value),
    handleSteerClick: startAction(async () => send("steer")),
    handleFollowUpClick: startAction(async () => send("followUp")),
  };
};
