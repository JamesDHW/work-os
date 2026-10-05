import { createFileRoute, redirect } from "@tanstack/react-router";

import { apiClient } from "#web/api/client.ts";

export const Route = createFileRoute("/")({
  beforeLoad: async () => {
    const session = await apiClient.GET("/api/session");
    const workspace = session.data?.workspaces[0];
    // oxlint-disable-next-line architecture/no-raw-exceptions -- TanStack Router redirects from beforeLoad by throwing the redirect.
    if (workspace === undefined) throw redirect({ to: "/signIn" });
    // oxlint-disable-next-line architecture/no-raw-exceptions -- TanStack Router redirects from beforeLoad by throwing the redirect.
    throw redirect({ to: "/w/$workspaceId", params: { workspaceId: workspace.id } });
  },
});
