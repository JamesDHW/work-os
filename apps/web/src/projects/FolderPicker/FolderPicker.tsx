import type { FC } from "react";

import { Button } from "../../ui/Button/Button.tsx";
import { ErrorNotice } from "../../ui/ErrorNotice/ErrorNotice.tsx";
import { Icon } from "../../ui/Icon/Icon.tsx";
import { Stack } from "../../ui/Stack/Stack.tsx";
import { currentPath, folderButton, folderList, folderPicker } from "./FolderPicker.css.ts";
import { useFolderPicker } from "./FolderPicker.hook.ts";

export type FolderPickerProps = {
  readonly workspaceId: string;
  readonly runnerId: string;
  readonly onSelect: (path: string) => void;
};

export const FolderPicker: FC<FolderPickerProps> = (props) => {
  const model = useFolderPicker(props.workspaceId, props.runnerId, props.onSelect);
  const { listing } = model;

  if (listing === null) {
    return (
      <Stack gap="sm">
        <Button value="" disabled={model.isBusy || props.runnerId.length === 0} onClick={model.handleBrowseClick}>
          <Icon name="folder" />
          Browse this machine
        </Button>
        <ErrorNotice message={model.errorMessage} />
      </Stack>
    );
  }

  return (
    <div className={folderPicker}>
      <span className={currentPath}>{listing.path}</span>
      <Stack direction="row" gap="sm">
        {listing.parentPath === null ? null : (
          <Button tone="ghost" value={listing.parentPath} disabled={model.isBusy} onClick={model.handleBrowseClick}>
            Up
          </Button>
        )}
        <Button tone="primary" onClick={model.handleUseClick}>
          Use this folder
        </Button>
      </Stack>
      <ul className={folderList}>
        {listing.folders.map((folder) => (
          <li key={folder.path}>
            <button type="button" className={folderButton} value={folder.path} disabled={model.isBusy} onClick={model.handleBrowseClick}>
              <Icon name="folder" />
              {folder.name}
              {folder.isGitRepository ? " · git" : ""}
            </button>
          </li>
        ))}
      </ul>
      <ErrorNotice message={model.errorMessage} />
    </div>
  );
};
