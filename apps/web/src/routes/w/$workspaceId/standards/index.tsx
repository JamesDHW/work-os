import { createFileRoute } from "@tanstack/react-router";
import type { FC } from "react";

import { apiClient } from "#web/api/client.ts";
import { toFailure } from "#web/api/toFailure.ts";
import { toReady } from "#web/api/toReady.ts";
import { StandardsScreen } from "#web/standards/StandardsScreen/StandardsScreen.tsx";
import { ErrorNotice } from "#web/ui/ErrorNotice/ErrorNotice.tsx";

const StandardsRoute: FC = () => {
  const loaded = Route.useLoaderData();
  const { workspaceId } = Route.useParams();
  if (loaded.kind === "failed") return <ErrorNotice message={loaded.message} />;

  return <StandardsScreen workspaceId={workspaceId} standards={loaded.value} />;
};

export const Route = createFileRoute("/w/$workspaceId/standards/")({
  loader: async ({ params }) => {
    const standards = await apiClient.GET("/api/w/{workspaceId}/standards", { params: { path: { workspaceId: params.workspaceId } } });
    if (standards.data === undefined) return toFailure(standards);
    return toReady(standards.data);
  },
  component: StandardsRoute,
});
