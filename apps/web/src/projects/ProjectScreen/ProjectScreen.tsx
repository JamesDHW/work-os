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

export const ProjectScreen: FC<ProjectScreenProps> = ({ runners, project, workspaceId, standards, runs }) => {
  const runner = runners.find((candidate) => candidate.id === project.location.runnerId);
  const actions = <StartRunDialog workspaceId={workspaceId} projects={[project]} standards={standards} projectId={project.id} />;

  return (
    <Stack gap="lg">
      <PageHeader title={project.name} actions={actions} />
      <ProjectCard workspaceId={workspaceId} project={project} runner={runner} />
      <Heading level="section">Runs</Heading>
      <RunList workspaceId={workspaceId} runs={runs} emptyText="No runs on this project yet." />
    </Stack>
  );
};
