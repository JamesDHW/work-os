import { createFileRoute } from "@tanstack/react-router";
import type { FC } from "react";

import { apiClient } from "#web/api/client.ts";
import { toFailure } from "#web/api/toFailure.ts";
import { toReady } from "#web/api/toReady.ts";
import { RunScreen } from "#web/runs/RunScreen/RunScreen.tsx";
import { ErrorNotice } from "#web/ui/ErrorNotice/ErrorNotice.tsx";

const RunRoute: FC = () => {
  const loaded = Route.useLoaderData();
  const { workspaceId } = Route.useParams();
  if (loaded.kind === "failed") return <ErrorNotice message={loaded.message} />;

  return <RunScreen workspaceId={workspaceId} detail={loaded.value.detail} capabilities={loaded.value.capabilities} />;
};

export const Route = createFileRoute("/w/$workspaceId/runs/$runId/")({
  loader: async ({ params }) => {
    const { workspaceId, runId } = params;
    const [detail, capabilities] = await Promise.all([
      apiClient.GET("/api/w/{workspaceId}/runs/{runId}", { params: { path: { workspaceId, runId } } }),
      apiClient.GET("/api/w/{workspaceId}/capabilities", { params: { path: { workspaceId } } }),
    ]);
    if (detail.data === undefined) return toFailure(detail);
    if (capabilities.data === undefined) return toFailure(capabilities);
    return toReady({ detail: detail.data, capabilities: capabilities.data });
  },
  component: RunRoute,
});
