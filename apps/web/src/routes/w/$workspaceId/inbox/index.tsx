import { createFileRoute } from "@tanstack/react-router";
import type { FC } from "react";

import { apiClient } from "#web/api/client.ts";
import { toFailure } from "#web/api/toFailure.ts";
import { toReady } from "#web/api/toReady.ts";
import { InboxScreen } from "#web/inbox/InboxScreen/InboxScreen.tsx";
import { ErrorNotice } from "#web/ui/ErrorNotice/ErrorNotice.tsx";

const InboxRoute: FC = () => {
  const loaded = Route.useLoaderData();
  const { workspaceId } = Route.useParams();
  if (loaded.kind === "failed") return <ErrorNotice message={loaded.message} />;

  return <InboxScreen workspaceId={workspaceId} inboxItems={loaded.value} />;
};

export const Route = createFileRoute("/w/$workspaceId/inbox/")({
  loader: async ({ params }) => {
    const inboxItems = await apiClient.GET("/api/w/{workspaceId}/inbox", { params: { path: { workspaceId: params.workspaceId } } });
    if (inboxItems.data === undefined) return toFailure(inboxItems);
    return toReady(inboxItems.data);
  },
  component: InboxRoute,
});
