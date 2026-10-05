import type { FC } from "react";

import type { Connection, Environment, Project, Runner } from "../../api/apiTypes.ts";
import { EmptyState } from "../../ui/EmptyState/EmptyState.tsx";
import { PageHeader } from "../../ui/PageHeader/PageHeader.tsx";
import { Stack } from "../../ui/Stack/Stack.tsx";
import { CreateProjectDialog } from "../CreateProjectDialog/CreateProjectDialog.tsx";
import { ProjectCard } from "../ProjectCard/ProjectCard.tsx";

export type ProjectsScreenProps = {
  readonly workspaceId: string;
  readonly projects: readonly Project[];
  readonly runners: readonly Runner[];
  readonly environments: readonly Environment[];
  readonly connections: readonly Connection[];
};

export const ProjectsScreen: FC<ProjectsScreenProps> = ({ workspaceId, runners, environments, connections, projects }) => {
  const actions = <CreateProjectDialog workspaceId={workspaceId} runners={runners} environments={environments} connections={connections} />;
  const emptyText = runners.length === 0 ? "Pair a machine in Settings first, then add a folder on it as a project." : "Add a local folder as your first project.";

  return (
    <Stack gap="lg">
      <PageHeader title="Projects" description="Local folders on your paired machines." actions={actions} />
      {projects.length === 0 ? <EmptyState>{emptyText}</EmptyState> : null}
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          workspaceId={workspaceId}
          project={project}
          runner={runners.find((runner) => runner.id === project.location.runnerId)}
        />
      ))}
    </Stack>
  );
};
