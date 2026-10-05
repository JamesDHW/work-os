import { createFileRoute } from "@tanstack/react-router";
import type { FC } from "react";

import { apiClient } from "#web/api/client.ts";
import { toFailure } from "#web/api/toFailure.ts";
import { toReady } from "#web/api/toReady.ts";
import { ProjectsScreen } from "#web/projects/ProjectsScreen/ProjectsScreen.tsx";
import { ErrorNotice } from "#web/ui/ErrorNotice/ErrorNotice.tsx";

const ProjectsRoute: FC = () => {
  const loaded = Route.useLoaderData();
  const { workspaceId } = Route.useParams();
  if (loaded.kind === "failed") return <ErrorNotice message={loaded.message} />;

  return (
    <ProjectsScreen
      workspaceId={workspaceId}
      projects={loaded.value.projects}
      runners={loaded.value.runners}
      environments={loaded.value.environments}
      connections={loaded.value.connections}
    />
  );
};

export const Route = createFileRoute("/w/$workspaceId/projects/")({
  loader: async ({ params }) => {
    const path = { path: { workspaceId: params.workspaceId } };
    const [projects, runners, environments, connections] = await Promise.all([
      apiClient.GET("/api/w/{workspaceId}/projects", { params: path }),
      apiClient.GET("/api/w/{workspaceId}/runners", { params: path }),
      apiClient.GET("/api/w/{workspaceId}/environments", { params: path }),
      apiClient.GET("/api/w/{workspaceId}/connections", { params: path }),
    ]);
    if (projects.data === undefined) return toFailure(projects);
    if (runners.data === undefined) return toFailure(runners);
    if (environments.data === undefined) return toFailure(environments);
    if (connections.data === undefined) return toFailure(connections);
    return toReady({ projects: projects.data, runners: runners.data, environments: environments.data, connections: connections.data });
  },
  component: ProjectsRoute,
});
