import type { FC } from "react";

import type { Capability, Connection } from "../../api/apiTypes.ts";
import { Button } from "../../ui/Button/Button.tsx";
import { Card } from "../../ui/Card/Card.tsx";
import { EmptyState } from "../../ui/EmptyState/EmptyState.tsx";
import { ErrorNotice } from "../../ui/ErrorNotice/ErrorNotice.tsx";
import { Field } from "../../ui/Field/Field.tsx";
import { SelectInput } from "../../ui/Field/SelectInput.tsx";
import { TextInput } from "../../ui/Field/TextInput.tsx";
import { Heading, MutedText } from "../../ui/Heading/Heading.tsx";
import { Stack } from "../../ui/Stack/Stack.tsx";
import { connectionList, connectionMeta, connectionRow } from "./ConnectionsSection.css.ts";
import { useConnectionsSection } from "./ConnectionsSection.hook.ts";

export type ConnectionsSectionProps = {
  readonly workspaceId: string;
  readonly connections: readonly Connection[];
  readonly capabilities: readonly Capability[];
};

export const ConnectionsSection: FC<ConnectionsSectionProps> = (props) => {
  const connectionKinds = [...new Set(props.capabilities.map((capability) => capability.connectionKind).filter((connectionKind) => connectionKind.length > 0))];
  const model = useConnectionsSection(props.workspaceId, connectionKinds[0] ?? "");
  const canAdd = !model.isBusy && model.kind.length > 0 && model.label.trim().length > 0 && model.secret.length > 0;

  return (
    <Card>
      <Heading level="section">Connections</Heading>
      <MutedText>Credentials for outside services. They stay encrypted on the server and never enter a container.</MutedText>
      {props.connections.length === 0 ? <EmptyState>No connections yet.</EmptyState> : null}
      <ul className={connectionList}>
        {props.connections.map((connection) => (
          <li key={connection.id} className={connectionRow}>
            <span>
              {connection.label} <span className={connectionMeta}>({connection.kind})</span>
            </span>
            <Button tone="ghost" value={connection.id} onClick={model.handleRemoveClick}>
              Remove
            </Button>
          </li>
        ))}
      </ul>
      <Stack direction="row" gap="sm">
        <Field label="Kind">
          <SelectInput value={model.kind} onChange={model.handleKindChange}>
            {connectionKinds.map((connectionKind) => (
              <option key={connectionKind} value={connectionKind}>
                {connectionKind}
              </option>
            ))}
          </SelectInput>
        </Field>
        <Field label="Label">
          <TextInput value={model.label} onChange={model.handleLabelChange} placeholder="Personal GitHub" />
        </Field>
        <Field label="Token">
          <TextInput type="password" autoComplete="off" value={model.secret} onChange={model.handleSecretChange} />
        </Field>
      </Stack>
      <ErrorNotice message={model.errorMessage} />
      <div>
        <Button disabled={!canAdd} onClick={model.handleAddClick}>
          Add connection
        </Button>
      </div>
    </Card>
  );
};
