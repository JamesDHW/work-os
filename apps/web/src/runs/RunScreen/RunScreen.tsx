import type { FC } from "react";

import type { Capability, RunDetail } from "../../api/apiTypes.ts";
import { Button } from "../../ui/Button/Button.tsx";
import { Card } from "../../ui/Card/Card.tsx";
import { ErrorNotice } from "../../ui/ErrorNotice/ErrorNotice.tsx";
import { Heading } from "../../ui/Heading/Heading.tsx";
import { Icon } from "../../ui/Icon/Icon.tsx";
import { PageHeader } from "../../ui/PageHeader/PageHeader.tsx";
import { Stack } from "../../ui/Stack/Stack.tsx";
import { AddCapability } from "../AddCapability/AddCapability.tsx";
import { CapabilityCalls } from "../CapabilityCalls/CapabilityCalls.tsx";
import { ChangedFiles } from "../ChangedFiles/ChangedFiles.tsx";
import { describeRun } from "../describeRun.ts";
import { isActiveRun } from "../isActiveRun.ts";
import { MessageBox } from "../MessageBox/MessageBox.tsx";
import { RunStateNote } from "../RunStateNote/RunStateNote.tsx";
import { RunStatusBadge } from "../RunStatusBadge/RunStatusBadge.tsx";
import { Transcript } from "../Transcript/Transcript.tsx";
import { capabilityChip, layout } from "./RunScreen.css.ts";
import { useRunScreen } from "./RunScreen.hook.ts";

export type RunScreenProps = {
  readonly workspaceId: string;
  readonly detail: RunDetail;
  readonly capabilities: readonly Capability[];
};

export const RunScreen: FC<RunScreenProps> = ({ workspaceId, detail, capabilities }) => {
  const { run } = detail;
  const model = useRunScreen(workspaceId, run.id);
  const isActive = isActiveRun(run);
  const availableCapabilities = capabilities.filter((capability) => !detail.capabilities.includes(capability.id));
  const stopButton = (
    <Button tone="danger" disabled={model.isStopping} onClick={model.handleStopClick}>
      <Icon name="stop" />
      Stop
    </Button>
  );

  return (
    <Stack gap="lg">
      <PageHeader title={describeRun(run)} description={`${run.standardId} · started ${new Date(run.createdAt).toLocaleString()}`} actions={isActive ? stopButton : null} />
      <Stack direction="row" gap="sm">
        <RunStatusBadge status={run.state.status} />
        <RunStateNote state={run.state} />
      </Stack>
      <ErrorNotice message={model.errorMessage} />
      <div className={layout}>
        <Stack>
          <Heading level="section">Conversation</Heading>
          <Transcript entries={detail.transcript} streamingText={detail.streamingText} />
          {isActive ? <MessageBox workspaceId={workspaceId} runId={run.id} isAgentWorking={run.state.status === "running"} /> : null}
        </Stack>
        <Stack>
          <Card>
            <Heading level="section">Changes</Heading>
            <ChangedFiles changedFiles={detail.changedFiles} diff={detail.diff} />
          </Card>
          <Card>
            <Heading level="section">Capabilities</Heading>
            <Stack direction="row" gap="sm">
              {detail.capabilities.map((capabilityId) => (
                <span key={capabilityId} className={capabilityChip}>
                  {capabilityId}
                </span>
              ))}
            </Stack>
            {isActive ? <AddCapability workspaceId={workspaceId} runId={run.id} availableCapabilities={availableCapabilities} /> : null}
            <CapabilityCalls calls={detail.capabilityCalls} />
          </Card>
        </Stack>
      </div>
    </Stack>
  );
};
