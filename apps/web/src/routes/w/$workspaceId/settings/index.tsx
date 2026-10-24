import { createFileRoute } from "@tanstack/react-router";
import type { FC } from "react";

import { apiClient } from "#web/api/client.ts";
import { toFailure } from "#web/api/toFailure.ts";
import { toReady } from "#web/api/toReady.ts";
import { SettingsScreen } from "#web/settings/SettingsScreen/SettingsScreen.tsx";
import { ErrorNotice } from "#web/ui/ErrorNotice/ErrorNotice.tsx";

const SettingsRoute: FC = () => {
  const loaded = Route.useLoaderData();
  const { workspaceId } = Route.useParams();
  if (loaded.kind === "failed") return <ErrorNotice message={loaded.message} />;

  return (
    <SettingsScreen
      workspaceId={workspaceId}
      runners={loaded.value.runners}
      connections={loaded.value.connections}
      capabilities={loaded.value.capabilities}
      grants={loaded.value.grants}
      providers={loaded.value.providers}
      models={loaded.value.models}
      defaultModel={loaded.value.defaultModel}
    />
  );
};

export const Route = createFileRoute("/w/$workspaceId/settings/")({
  loader: async ({ params }) => {
    const path = { path: { workspaceId: params.workspaceId } };
    const [runners, connections, capabilities, grants, providers, models, defaultModel] = await Promise.all([
      apiClient.GET("/api/w/{workspaceId}/runners", { params: path }),
      apiClient.GET("/api/w/{workspaceId}/connections", { params: path }),
      apiClient.GET("/api/w/{workspaceId}/capabilities", { params: path }),
      apiClient.GET("/api/w/{workspaceId}/grants", { params: path }),
      apiClient.GET("/api/models/providers"),
      apiClient.GET("/api/models"),
      apiClient.GET("/api/w/{workspaceId}/models/default", { params: path }),
    ]);
    if (runners.data === undefined) return toFailure(runners);
    if (connections.data === undefined) return toFailure(connections);
    if (capabilities.data === undefined) return toFailure(capabilities);
    if (grants.data === undefined) return toFailure(grants);
    if (providers.data === undefined) return toFailure(providers);
    if (models.data === undefined) return toFailure(models);
    return toReady({
      runners: runners.data,
      connections: connections.data,
      capabilities: capabilities.data,
      grants: grants.data,
      providers: providers.data,
      models: models.data.models,
      defaultModel: defaultModel.data?.model ?? null,
    });
  },
  component: SettingsRoute,
});
