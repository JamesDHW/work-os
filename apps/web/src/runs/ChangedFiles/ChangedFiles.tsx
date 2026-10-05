import type { FC } from "react";

import type { ChangedFile } from "../../api/apiTypes.ts";
import { EmptyState } from "../../ui/EmptyState/EmptyState.tsx";
import { Stack } from "../../ui/Stack/Stack.tsx";
import { DiffView } from "../DiffView/DiffView.tsx";
import { CHANGE_LABELS } from "../runs.constants.ts";
import { changeMark, fileList } from "./ChangedFiles.css.ts";

export type ChangedFilesProps = {
  readonly changedFiles: readonly ChangedFile[];
  readonly diff: string | null;
};

export const ChangedFiles: FC<ChangedFilesProps> = (props) => {
  if (props.changedFiles.length === 0) return <EmptyState>No files have changed.</EmptyState>;

  return (
    <Stack gap="sm">
      <ul className={fileList}>
        {props.changedFiles.map((changedFile) => (
          <li key={changedFile.path}>
            <span className={changeMark} title={changedFile.change}>
              {CHANGE_LABELS[changedFile.change]}
            </span>
            {changedFile.path}
          </li>
        ))}
      </ul>
      {props.diff === null ? null : <DiffView diff={props.diff} />}
    </Stack>
  );
};
