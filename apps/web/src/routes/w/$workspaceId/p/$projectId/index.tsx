import { createFileRoute } from "@tanstack/react-router";
import type { FC } from "react";

import { apiClient } from "#web/api/client.ts";
import { toFailure } from "#web/api/toFailure.ts";
import { toReady } from "#web/api/toReady.ts";
import { ProjectScreen } from "#web/projects/ProjectScreen/ProjectScreen.tsx";
import { ErrorNotice } from "#web/ui/ErrorNotice/ErrorNotice.tsx";

const ProjectRoute: FC = () => {
  const loaded = Route.useLoaderData();
  const { workspaceId } = Route.useParams();
  if (loaded.kind === "failed") return <ErrorNotice message={loaded.message} />;

  return (
    <ProjectScreen
      workspaceId={workspaceId}
      project={loaded.value.project}
      runners={loaded.value.runners}
      runs={loaded.value.runs}
      standards={loaded.value.standards}
    />
  );
};

export const Route = createFileRoute("/w/$workspaceId/p/$projectId/")({
  loader: async ({ params }) => {
    const { workspaceId, projectId } = params;
    const path = { path: { workspaceId } };
    const [project, runners, runs, standards] = await Promise.all([
      apiClient.GET("/api/w/{workspaceId}/projects/{projectId}", { params: { path: { workspaceId, projectId } } }),
      apiClient.GET("/api/w/{workspaceId}/runners", { params: path }),
      apiClient.GET("/api/w/{workspaceId}/runs", { params: { ...path, query: { projectId } } }),
      apiClient.GET("/api/w/{workspaceId}/standards", { params: path }),
    ]);
    if (project.data === undefined) return toFailure(project);
    if (runners.data === undefined) return toFailure(runners);
    if (runs.data === undefined) return toFailure(runs);
    if (standards.data === undefined) return toFailure(standards);
    return toReady({ project: project.data, runners: runners.data, runs: runs.data, standards: standards.data });
  },
  component: ProjectRoute,
});
