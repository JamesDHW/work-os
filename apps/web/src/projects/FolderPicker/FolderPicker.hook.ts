import { useState } from "react";

import type { FolderListing } from "../../api/apiTypes.ts";
import { apiClient } from "../../api/client.ts";
import { describeFailure } from "../../api/describeFailure.ts";

export type FolderPickerModel = {
  readonly listing: FolderListing | null;
  readonly errorMessage: string | null;
  readonly isBusy: boolean;
  readonly handleBrowseClick: (path: string | undefined) => () => Promise<void>;
  readonly handleUseClick: () => void;
};

export const useFolderPicker = (workspaceId: string, runnerId: string, onSelect: (path: string) => void): FolderPickerModel => {
  const [listing, setListing] = useState<FolderListing | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  // Without a path the runner lists the machine's home folder.
  const browse = async (path: string | undefined): Promise<void> => {
    const query = path === undefined ? {} : { path };
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

  return { listing, errorMessage, isBusy, handleBrowseClick: (path) => async () => browse(path), handleUseClick };
};
