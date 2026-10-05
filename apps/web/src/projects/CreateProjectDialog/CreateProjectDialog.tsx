import type { FC } from "react";

import type { Connection, Environment, Runner } from "../../api/apiTypes.ts";
import { Button } from "../../ui/Button/Button.tsx";
import { Checkbox } from "../../ui/Checkbox/Checkbox.tsx";
import { Dialog } from "../../ui/Dialog/Dialog.tsx";
import { ErrorNotice } from "../../ui/ErrorNotice/ErrorNotice.tsx";
import { Field } from "../../ui/Field/Field.tsx";
import { SelectInput } from "../../ui/Field/SelectInput.tsx";
import { TextInput } from "../../ui/Field/TextInput.tsx";
import { Stack } from "../../ui/Stack/Stack.tsx";
import { FolderPicker } from "../FolderPicker/FolderPicker.tsx";
import { useCreateProjectDialog } from "./CreateProjectDialog.hook.ts";

export type CreateProjectDialogProps = {
  readonly workspaceId: string;
  readonly runners: readonly Runner[];
  readonly environments: readonly Environment[];
  readonly connections: readonly Connection[];
};

export const CreateProjectDialog: FC<CreateProjectDialogProps> = ({ runners, environments, workspaceId, connections }) => {
  const defaults = { runnerId: runners[0]?.id ?? "", environmentId: environments[0]?.id ?? "" };
  const model = useCreateProjectDialog(workspaceId, defaults);
  const canCreate = !model.isBusy && model.name.trim().length > 0 && model.path.length > 0 && model.runnerId.length > 0;
  const trigger = (
    <Button tone="primary" disabled={runners.length === 0}>
      Add a project
    </Button>
  );

  return (
    <Dialog title="Add a project" trigger={trigger} isOpen={model.isOpen} onOpenChange={model.handleOpenChange}>
      <Stack>
        <Field label="Machine">
          <SelectInput value={model.runnerId} onChange={model.handleRunnerChange}>
            {runners.map((runner) => (
              <option key={runner.id} value={runner.id}>
                {runner.name} {runner.isOnline ? "" : "(offline)"}
              </option>
            ))}
          </SelectInput>
        </Field>
        <Field label="Folder" hint="A folder on that machine. Runs mount it into their container.">
          <TextInput value={model.path} onChange={model.handlePathChange} placeholder="/Users/you/Repos/project" />
        </Field>
        <FolderPicker key={model.runnerId} workspaceId={workspaceId} runnerId={model.runnerId} onSelect={model.handleFolderSelect} />
        <Field label="Name">
          <TextInput value={model.name} onChange={model.handleNameChange} />
        </Field>
        <Field label="Environment">
          <SelectInput value={model.environmentId} onChange={model.handleEnvironmentChange}>
            {environments.map((environment) => (
              <option key={environment.id} value={environment.id}>
                {environment.id}
              </option>
            ))}
          </SelectInput>
        </Field>
        {connections.length > 0 ? (
          <Field label="Connections this project may use">
            {connections.map((connection) => (
              <Checkbox
                key={connection.id}
                label={`${connection.label} (${connection.kind})`}
                isChecked={model.connectionIds.includes(connection.id)}
                onChange={model.handleConnectionToggle(connection.id)}
              />
            ))}
          </Field>
        ) : null}
        <ErrorNotice message={model.errorMessage} />
        <Stack direction="row" justify="end">
          <Button tone="primary" disabled={!canCreate} onClick={model.handleCreateClick}>
            Add project
          </Button>
        </Stack>
      </Stack>
    </Dialog>
  );
};
