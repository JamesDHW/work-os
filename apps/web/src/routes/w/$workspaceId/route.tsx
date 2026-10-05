import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { apiClient } from "#web/api/client.ts";
import { AppShell } from "#web/shell/AppShell/AppShell.tsx";

const WorkspaceLayout = () => {
  const { workspace } = Route.useLoaderData();
  return (
    <AppShell workspaceId={workspace.id} workspaceName={workspace.name}>
      <Outlet />
    </AppShell>
  );
};

export const Route = createFileRoute("/w/$workspaceId")({
  loader: async ({ params }) => {
    const session = await apiClient.GET("/api/session");
    const workspace = session.data?.workspaces.find((candidate) => candidate.id === params.workspaceId);
    // oxlint-disable-next-line architecture/no-raw-exceptions -- TanStack Router redirects from loaders by throwing the redirect.
    if (workspace === undefined) throw redirect({ to: "/signIn" });
    return { workspace };
  },
  component: WorkspaceLayout,
});
