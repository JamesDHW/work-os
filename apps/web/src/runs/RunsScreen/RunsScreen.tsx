import type { FC } from "react";

import type { Project, RunSummary, Standard } from "../../api/apiTypes.ts";
import { Heading } from "../../ui/Heading/Heading.tsx";
import { PageHeader } from "../../ui/PageHeader/PageHeader.tsx";
import { Stack } from "../../ui/Stack/Stack.tsx";
import { isActiveRun } from "../isActiveRun.ts";
import { RunList } from "../RunList/RunList.tsx";
import { StartRunDialog } from "../StartRunDialog/StartRunDialog.tsx";

export type RunsScreenProps = {
  readonly workspaceId: string;
  readonly runs: readonly RunSummary[];
  readonly projects: readonly Project[];
  readonly standards: readonly Standard[];
};

export const RunsScreen: FC<RunsScreenProps> = (props) => {
  const activeRuns = props.runs.filter(isActiveRun);
  const finishedRuns = props.runs.filter((run) => !isActiveRun(run));
  const actions = <StartRunDialog workspaceId={props.workspaceId} projects={props.projects} standards={props.standards} />;

  return (
    <Stack gap="lg">
      <PageHeader title="Runs" description="Every run follows a standard against one project." actions={actions} />
      <Heading level="section">Active</Heading>
      <RunList workspaceId={props.workspaceId} runs={activeRuns} emptyText="No runs are active." />
      <Heading level="section">Finished</Heading>
      <RunList workspaceId={props.workspaceId} runs={finishedRuns} emptyText="No finished runs yet." />
    </Stack>
  );
};
