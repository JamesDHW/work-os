import { useNavigate } from "@tanstack/react-router";
import { useState, type ChangeEvent } from "react";

import { apiClient } from "../../api/client.ts";
import { describeFailure } from "../../api/describeFailure.ts";
import { startAction } from "../../api/startAction.ts";

export type StartRunDialogModel = {
  readonly isOpen: boolean;
  readonly projectId: string;
  readonly standardId: string;
  readonly prompt: string;
  readonly errorMessage: string | null;
  readonly isBusy: boolean;
  readonly handleOpenChange: (isOpen: boolean) => void;
  readonly handleProjectChange: (event: ChangeEvent<HTMLSelectElement>) => void;
  readonly handleStandardChange: (event: ChangeEvent<HTMLSelectElement>) => void;
  readonly handlePromptChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
  readonly handleStartClick: () => void;
};

export type StartRunDefaults = {
  readonly projectId: string;
  readonly standardId: string;
};

export const useStartRunDialog = (workspaceId: string, defaults: StartRunDefaults): StartRunDialogModel => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [projectId, setProjectId] = useState(defaults.projectId);
  const [standardId, setStandardId] = useState(defaults.standardId);
  const [prompt, setPrompt] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  const startRun = async (): Promise<void> => {
    setIsBusy(true);
    const result = await apiClient.POST("/api/w/{workspaceId}/runs", { params: { path: { workspaceId } }, body: { projectId, standardId, prompt } });
    setIsBusy(false);
    if (result.data === undefined) {
      setErrorMessage(describeFailure(result));
      return;
    }
    setIsOpen(false);
    setPrompt("");
    await navigate({ to: "/w/$workspaceId/runs/$runId", params: { workspaceId, runId: result.data.id } });
  };

  return {
    isOpen,
    projectId,
    standardId,
    prompt,
    errorMessage,
    isBusy,
    handleOpenChange: setIsOpen,
    handleProjectChange: (event) => setProjectId(event.target.value),
    handleStandardChange: (event) => setStandardId(event.target.value),
    handlePromptChange: (event) => setPrompt(event.target.value),
    handleStartClick: startAction(startRun),
  };
};
