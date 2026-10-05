import { useRouter } from "@tanstack/react-router";
import { useState, type ChangeEvent } from "react";

import { apiClient } from "../../api/client.ts";
import { describeFailure } from "../../api/describeFailure.ts";
import { startAction } from "../../api/startAction.ts";

export type CreateProjectDialogModel = {
  readonly isOpen: boolean;
  readonly name: string;
  readonly runnerId: string;
  readonly path: string;
  readonly environmentId: string;
  readonly connectionIds: readonly string[];
  readonly errorMessage: string | null;
  readonly isBusy: boolean;
  readonly handleOpenChange: (isOpen: boolean) => void;
  readonly handleNameChange: (event: ChangeEvent<HTMLInputElement>) => void;
  readonly handleRunnerChange: (event: ChangeEvent<HTMLSelectElement>) => void;
  readonly handlePathChange: (event: ChangeEvent<HTMLInputElement>) => void;
  readonly handleFolderSelect: (path: string) => void;
  readonly handleEnvironmentChange: (event: ChangeEvent<HTMLSelectElement>) => void;
  readonly handleConnectionToggle: (event: ChangeEvent<HTMLInputElement>) => void;
  readonly handleCreateClick: () => void;
};

export type CreateProjectDefaults = {
  readonly runnerId: string;
  readonly environmentId: string;
};

const lastSegment = (path: string): string => path.split(/[\\/]/u).findLast((segment) => segment.length > 0) ?? "";

export const useCreateProjectDialog = (workspaceId: string, defaults: CreateProjectDefaults): CreateProjectDialogModel => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [runnerId, setRunnerId] = useState(defaults.runnerId);
  const [path, setPath] = useState("");
  const [environmentId, setEnvironmentId] = useState(defaults.environmentId);
  const [connectionIds, setConnectionIds] = useState<readonly string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  const handleFolderSelect = (selectedPath: string): void => {
    setPath(selectedPath);
    if (name.trim().length === 0) {
      setName(lastSegment(selectedPath));
    }
  };

  const createProject = async (): Promise<void> => {
    setIsBusy(true);
    const body = { name, runnerId, path, environmentId, connectionIds: [...connectionIds] };
    const result = await apiClient.POST("/api/w/{workspaceId}/projects", { params: { path: { workspaceId } }, body });
    setIsBusy(false);
    const failure = describeFailure(result);
    setErrorMessage(failure);
    if (failure === null) {
      setIsOpen(false);
    }
    await router.invalidate();
  };

  return {
    isOpen,
    name,
    runnerId,
    path,
    environmentId,
    connectionIds,
    errorMessage,
    isBusy,
    handleOpenChange: setIsOpen,
    handleNameChange: (event) => setName(event.target.value),
    handleRunnerChange: (event) => setRunnerId(event.target.value),
    handlePathChange: (event) => setPath(event.target.value),
    handleFolderSelect,
    handleEnvironmentChange: (event) => setEnvironmentId(event.target.value),
    handleConnectionToggle: (event) => {
      const { checked: isChecked, value: connectionId } = event.target;
      setConnectionIds((previousIds) => (isChecked ? [...previousIds, connectionId] : previousIds.filter((previousId) => previousId !== connectionId)));
    },
    handleCreateClick: startAction(createProject),
  };
};
