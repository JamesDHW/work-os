import { createFileRoute } from "@tanstack/react-router";
import type { FC } from "react";

import { apiClient } from "#web/api/client.ts";
import { toFailure } from "#web/api/toFailure.ts";
import { toReady } from "#web/api/toReady.ts";
import { StandardEditor } from "#web/standards/StandardEditor/StandardEditor.tsx";
import { ErrorNotice } from "#web/ui/ErrorNotice/ErrorNotice.tsx";

const StandardRoute: FC = () => {
  const loaded = Route.useLoaderData();
  const { workspaceId } = Route.useParams();
  if (loaded.kind === "failed") return <ErrorNotice message={loaded.message} />;

  return (
    <StandardEditor
      key={loaded.value.standard.id}
      workspaceId={workspaceId}
      standard={loaded.value.standard}
      agents={loaded.value.agents}
      capabilities={loaded.value.capabilities}
    />
  );
};

export const Route = createFileRoute("/w/$workspaceId/standards/$standardId/")({
  loader: async ({ params }) => {
    const { workspaceId, standardId } = params;
    const path = { path: { workspaceId } };
    const [standard, agents, capabilities] = await Promise.all([
      apiClient.GET("/api/w/{workspaceId}/standards/{standardId}", { params: { path: { workspaceId, standardId } } }),
      apiClient.GET("/api/w/{workspaceId}/agents", { params: path }),
      apiClient.GET("/api/w/{workspaceId}/capabilities", { params: path }),
    ]);
    if (standard.data === undefined) return toFailure(standard);
    if (agents.data === undefined) return toFailure(agents);
    if (capabilities.data === undefined) return toFailure(capabilities);
    return toReady({ standard: standard.data, agents: agents.data, capabilities: capabilities.data });
  },
  component: StandardRoute,
});
