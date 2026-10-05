import type { FC } from "react";

import type { AgentPreset, Capability, Standard } from "../../api/apiTypes.ts";
import { Button } from "../../ui/Button/Button.tsx";
import { Card } from "../../ui/Card/Card.tsx";
import { Checkbox } from "../../ui/Checkbox/Checkbox.tsx";
import { ErrorNotice } from "../../ui/ErrorNotice/ErrorNotice.tsx";
import { Field } from "../../ui/Field/Field.tsx";
import { SelectInput } from "../../ui/Field/SelectInput.tsx";
import { TextArea } from "../../ui/Field/TextArea.tsx";
import { TextInput } from "../../ui/Field/TextInput.tsx";
import { MutedText } from "../../ui/Heading/Heading.tsx";
import { PageHeader } from "../../ui/PageHeader/PageHeader.tsx";
import { Stack } from "../../ui/Stack/Stack.tsx";
import { REVIEW_MODE_LABELS, REVIEW_MODES } from "../standards.constants.ts";
import { useStandardEditor } from "./StandardEditor.hook.ts";

export type StandardEditorProps = {
  readonly workspaceId: string;
  readonly standard: Standard;
  readonly agents: readonly AgentPreset[];
  readonly capabilities: readonly Capability[];
};

export const StandardEditor: FC<StandardEditorProps> = ({ workspaceId, standard, agents, capabilities }) => {
  const model = useStandardEditor(workspaceId, standard);
  const { form } = model;
  const saveButton = (
    <Button tone="primary" disabled={model.isBusy} onClick={model.handleSaveClick}>
      Save
    </Button>
  );

  return (
    <Stack gap="lg">
      <PageHeader title={standard.id} description="A standard says what good looks like for one kind of work." actions={saveButton} />
      <ErrorNotice message={model.errorMessage} />
      {model.savedMessage === null ? null : <MutedText>{model.savedMessage}</MutedText>}
      <Card>
        <Field label="Describes">
          <TextInput value={form.describes} onChange={model.handleTextChange("describes")} />
        </Field>
        <Field label="Consumer" hint="Who uses the result.">
          <TextInput value={form.consumer} onChange={model.handleTextChange("consumer")} />
        </Field>
        <Field label="Prompt hint" hint="Shown when someone starts a run.">
          <TextInput value={form.inputHint} onChange={model.handleTextChange("inputHint")} />
        </Field>
        <Field label="Criteria" hint="Markdown. What a finished result must satisfy.">
          <TextArea value={form.criteria} onChange={model.handleTextChange("criteria")} />
        </Field>
        <Field label="Method" hint="Markdown. How the agent should work.">
          <TextArea value={form.method} onChange={model.handleTextChange("method")} />
        </Field>
      </Card>
      <Card>
        <Field label="Agent">
          <SelectInput value={form.agentId} onChange={model.handleTextChange("agentId")}>
            {agents.map((agent) => (
              <option key={agent.id} value={agent.id}>
                {agent.name} ({agent.model})
              </option>
            ))}
          </SelectInput>
        </Field>
        <Field label="Skills" hint="Comma separated skill ids.">
          <TextInput value={form.skills} onChange={model.handleTextChange("skills")} />
        </Field>
        <Field label="Review">
          <SelectInput value={form.review} onChange={model.handleReviewChange}>
            {REVIEW_MODES.map((mode) => (
              <option key={mode} value={mode}>
                {REVIEW_MODE_LABELS[mode]}
              </option>
            ))}
          </SelectInput>
        </Field>
        <Field label="Checks" hint="One per line, as name: command. They run in the container after the agent finishes.">
          <TextArea value={form.checks} onChange={model.handleTextChange("checks")} />
        </Field>
        <Field label="Network access" hint="One host per line, in addition to the environment's.">
          <TextArea value={form.egress} onChange={model.handleTextChange("egress")} />
        </Field>
      </Card>
      <Card>
        <Field label="Capabilities" hint="Actions outside the container. Reversible and irreversible ones ask for approval.">
          {capabilities.map((capability) => (
            <Checkbox
              key={capability.id}
              label={`${capability.id} (${capability.effect}): ${capability.description}`}
              isChecked={form.capabilities.includes(capability.id)}
              onChange={model.handleCapabilityToggle(capability.id)}
            />
          ))}
        </Field>
      </Card>
    </Stack>
  );
};
