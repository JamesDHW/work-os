import type { FC } from "react";

import type { Project, Standard } from "../../api/apiTypes.ts";
import { Button } from "../../ui/Button/Button.tsx";
import { Dialog } from "../../ui/Dialog/Dialog.tsx";
import { ErrorNotice } from "../../ui/ErrorNotice/ErrorNotice.tsx";
import { Field } from "../../ui/Field/Field.tsx";
import { SelectInput } from "../../ui/Field/SelectInput.tsx";
import { TextArea } from "../../ui/Field/TextArea.tsx";
import { Icon } from "../../ui/Icon/Icon.tsx";
import { Stack } from "../../ui/Stack/Stack.tsx";
import { useStartRunDialog } from "./StartRunDialog.hook.ts";

export type StartRunDialogProps = {
  readonly workspaceId: string;
  readonly projects: readonly Project[];
  readonly standards: readonly Standard[];
  readonly projectId?: string | undefined;
};

export const StartRunDialog: FC<StartRunDialogProps> = (props) => {
  const defaults = { projectId: props.projectId ?? props.projects[0]?.id ?? "", standardId: props.standards[0]?.id ?? "" };
  const model = useStartRunDialog(props.workspaceId, defaults);
  const selectedStandard = props.standards.find((standard) => standard.id === model.standardId);
  const canStart = !model.isBusy && model.projectId.length > 0 && model.standardId.length > 0;
  const trigger = (
    <Button tone="primary" disabled={props.projects.length === 0}>
      <Icon name="play" />
      Start a run
    </Button>
  );

  return (
    <Dialog title="Start a run" trigger={trigger} isOpen={model.isOpen} onOpenChange={model.handleOpenChange}>
      <Stack>
        {props.projectId === undefined ? (
          <Field label="Project">
            <SelectInput value={model.projectId} onChange={model.handleProjectChange}>
              {props.projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </SelectInput>
          </Field>
        ) : null}
        <Field label="Standard" hint={selectedStandard?.describes}>
          <SelectInput value={model.standardId} onChange={model.handleStandardChange}>
            {props.standards.map((standard) => (
              <option key={standard.id} value={standard.id}>
                {standard.id}
              </option>
            ))}
          </SelectInput>
        </Field>
        <Field label="What should it do?">
          <TextArea value={model.prompt} onChange={model.handlePromptChange} placeholder={selectedStandard?.inputHint ?? "Describe the work."} />
        </Field>
        <ErrorNotice message={model.errorMessage} />
        <Stack direction="row" justify="end">
          <Button tone="primary" disabled={!canStart} onClick={model.handleStartClick}>
            Start
          </Button>
        </Stack>
      </Stack>
    </Dialog>
  );
};
