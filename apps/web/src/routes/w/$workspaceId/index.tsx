import { createFileRoute } from "@tanstack/react-router";
import type { FC } from "react";

import { apiClient } from "#web/api/client.ts";
import { toFailure } from "#web/api/toFailure.ts";
import { toReady } from "#web/api/toReady.ts";
import { HomeScreen } from "#web/dashboard/HomeScreen/HomeScreen.tsx";
import { ErrorNotice } from "#web/ui/ErrorNotice/ErrorNotice.tsx";

const HomeRoute: FC = () => {
  const loaded = Route.useLoaderData();
  const { workspaceId } = Route.useParams();
  if (loaded.kind === "failed") return <ErrorNotice message={loaded.message} />;

  return <HomeScreen workspaceId={workspaceId} inboxItems={loaded.value.inboxItems} runs={loaded.value.runs} />;
};

export const Route = createFileRoute("/w/$workspaceId/")({
  loader: async ({ params }) => {
    const path = { path: { workspaceId: params.workspaceId } };
    const [inboxItems, runs] = await Promise.all([apiClient.GET("/api/w/{workspaceId}/inbox", { params: path }), apiClient.GET("/api/w/{workspaceId}/runs", { params: path })]);
    if (inboxItems.data === undefined) return toFailure(inboxItems);
    if (runs.data === undefined) return toFailure(runs);
    return toReady({ inboxItems: inboxItems.data, runs: runs.data });
  },
  component: HomeRoute,
});
