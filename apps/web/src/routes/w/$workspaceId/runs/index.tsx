import { createFileRoute } from "@tanstack/react-router";
import type { FC } from "react";

import { apiClient } from "#web/api/client.ts";
import { toFailure } from "#web/api/toFailure.ts";
import { toReady } from "#web/api/toReady.ts";
import { RunsScreen } from "#web/runs/RunsScreen/RunsScreen.tsx";
import { ErrorNotice } from "#web/ui/ErrorNotice/ErrorNotice.tsx";

const RunsRoute: FC = () => {
  const loaded = Route.useLoaderData();
  const { workspaceId } = Route.useParams();
  if (loaded.kind === "failed") return <ErrorNotice message={loaded.message} />;

  return <RunsScreen workspaceId={workspaceId} runs={loaded.value.runs} projects={loaded.value.projects} standards={loaded.value.standards} />;
};

export const Route = createFileRoute("/w/$workspaceId/runs/")({
  loader: async ({ params }) => {
    const path = { path: { workspaceId: params.workspaceId } };
    const [runs, projects, standards] = await Promise.all([
      apiClient.GET("/api/w/{workspaceId}/runs", { params: path }),
      apiClient.GET("/api/w/{workspaceId}/projects", { params: path }),
      apiClient.GET("/api/w/{workspaceId}/standards", { params: path }),
    ]);
    if (runs.data === undefined) return toFailure(runs);
    if (projects.data === undefined) return toFailure(projects);
    if (standards.data === undefined) return toFailure(standards);
    return toReady({ runs: runs.data, projects: projects.data, standards: standards.data });
  },
  component: RunsRoute,
});
