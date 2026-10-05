import { useState, type MouseEvent } from "react";

import type { FolderListing } from "../../api/apiTypes.ts";
import { apiClient } from "../../api/client.ts";
import { describeFailure } from "../../api/describeFailure.ts";
import { startAction } from "../../api/startAction.ts";

export type FolderPickerModel = {
  readonly listing: FolderListing | null;
  readonly errorMessage: string | null;
  readonly isBusy: boolean;
  readonly handleBrowseClick: (event: MouseEvent<HTMLButtonElement>) => void;
  readonly handleUseClick: () => void;
};

export const useFolderPicker = (workspaceId: string, runnerId: string, onSelect: (path: string) => void): FolderPickerModel => {
  const [listing, setListing] = useState<FolderListing | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  // The button's value is the folder to list; an empty value lists the machine's home folder.
  const browse = async (event: MouseEvent<HTMLButtonElement>): Promise<void> => {
    const chosenPath = event.currentTarget.value;
    const query = chosenPath.length > 0 ? { path: chosenPath } : {};
    setIsBusy(true);
    const result = await apiClient.GET("/api/w/{workspaceId}/runners/{runnerId}/folders", { params: { path: { workspaceId, runnerId }, query } });
    setIsBusy(false);
    setErrorMessage(describeFailure(result));
    setListing(result.data ?? null);
  };

  const handleUseClick = (): void => {
    if (listing !== null) {
      onSelect(listing.path);
    }
  };

  return { listing, errorMessage, isBusy, handleBrowseClick: startAction(browse), handleUseClick };
};
