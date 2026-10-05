import type { FC } from "react";

import type { Runner } from "../../api/apiTypes.ts";
import { Button } from "../../ui/Button/Button.tsx";
import { Card } from "../../ui/Card/Card.tsx";
import { EmptyState } from "../../ui/EmptyState/EmptyState.tsx";
import { ErrorNotice } from "../../ui/ErrorNotice/ErrorNotice.tsx";
import { Heading, MutedText } from "../../ui/Heading/Heading.tsx";
import { StatusBadge } from "../../ui/StatusBadge/StatusBadge.tsx";
import { commandText, settingsList, settingsMeta, settingsRow } from "../settings.css.ts";
import { useMachinesSection } from "./MachinesSection.hook.ts";

export type MachinesSectionProps = {
  readonly workspaceId: string;
  readonly runners: readonly Runner[];
};

export const MachinesSection: FC<MachinesSectionProps> = (props) => {
  const model = useMachinesSection(props.workspaceId);

  return (
    <Card>
      <Heading level="section">Machines</Heading>
      <MutedText>A machine runs the work-os runner. Projects are folders on a machine; runs execute in containers there.</MutedText>
      {props.runners.length === 0 ? <EmptyState>No machines are paired yet.</EmptyState> : null}
      <ul className={settingsList}>
        {props.runners.map((runner) => (
          <li key={runner.id} className={settingsRow}>
            <span>
              {runner.name} <span className={settingsMeta}>({runner.platform})</span>
            </span>
            <StatusBadge tone={runner.isOnline ? "ok" : "queued"} label={runner.isOnline ? "Online" : "Offline"} />
          </li>
        ))}
      </ul>
      {model.pairingCode === null ? null : (
        <>
          <MutedText>Run this on the machine within ten minutes, then start the runner:</MutedText>
          <pre className={commandText}>
            work-os-runner pair {window.location.origin} {model.pairingCode.code}
            {"\n"}work-os-runner
          </pre>
        </>
      )}
      <ErrorNotice message={model.errorMessage} />
      <div>
        <Button disabled={model.isBusy} onClick={model.handlePairClick}>
          Pair a machine
        </Button>
      </div>
    </Card>
  );
};
