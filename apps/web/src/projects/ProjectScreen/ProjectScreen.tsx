import type { FC } from "react";

import type { Project, Runner, RunSummary, Standard } from "../../api/apiTypes.ts";
import { RunList } from "../../runs/RunList/RunList.tsx";
import { StartRunDialog } from "../../runs/StartRunDialog/StartRunDialog.tsx";
import { Heading } from "../../ui/Heading/Heading.tsx";
import { PageHeader } from "../../ui/PageHeader/PageHeader.tsx";
import { Stack } from "../../ui/Stack/Stack.tsx";
import { ProjectCard } from "../ProjectCard/ProjectCard.tsx";

export type ProjectScreenProps = {
  readonly workspaceId: string;
  readonly project: Project;
  readonly runners: readonly Runner[];
  readonly runs: readonly RunSummary[];
  readonly standards: readonly Standard[];
};

export const ProjectScreen: FC<ProjectScreenProps> = (props) => {
  const runner = props.runners.find((candidate) => candidate.id === props.project.location.runnerId);
  const actions = <StartRunDialog workspaceId={props.workspaceId} projects={[props.project]} standards={props.standards} projectId={props.project.id} />;

  return (
    <Stack gap="lg">
      <PageHeader title={props.project.name} actions={actions} />
      <ProjectCard workspaceId={props.workspaceId} project={props.project} runner={runner} />
      <Heading level="section">Runs</Heading>
      <RunList workspaceId={props.workspaceId} runs={props.runs} emptyText="No runs on this project yet." />
    </Stack>
  );
};
