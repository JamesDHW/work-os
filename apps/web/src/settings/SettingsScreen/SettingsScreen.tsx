import type { FC } from "react";

import type { Capability, Connection, Grant, ModelProvider, ModelSummary, Runner } from "../../api/apiTypes.ts";
import { ConnectionsSection } from "../../connections/ConnectionsSection/ConnectionsSection.tsx";
import { PasskeysSection } from "../../identity/PasskeysSection/PasskeysSection.tsx";
import { PageHeader } from "../../ui/PageHeader/PageHeader.tsx";
import { Stack } from "../../ui/Stack/Stack.tsx";
import { GrantsSection } from "../GrantsSection/GrantsSection.tsx";
import { MachinesSection } from "../MachinesSection/MachinesSection.tsx";
import { ModelsSection } from "../ModelsSection/ModelsSection.tsx";
import { NotificationsSection } from "../NotificationsSection/NotificationsSection.tsx";

export type SettingsScreenProps = {
  readonly workspaceId: string;
  readonly runners: readonly Runner[];
  readonly connections: readonly Connection[];
  readonly capabilities: readonly Capability[];
  readonly grants: readonly Grant[];
  readonly providers: readonly ModelProvider[];
  readonly models: readonly ModelSummary[];
  readonly defaultModel: string | null;
};

export const SettingsScreen: FC<SettingsScreenProps> = ({ workspaceId, runners, connections, capabilities, grants, providers, models, defaultModel }) => (
  <Stack gap="lg">
    <PageHeader title="Settings" description="Models, machines, connections, approvals and this device." />
    <ModelsSection workspaceId={workspaceId} providers={providers} models={models} defaultModel={defaultModel} />
    <MachinesSection workspaceId={workspaceId} runners={runners} />
    <ConnectionsSection workspaceId={workspaceId} connections={connections} capabilities={capabilities} />
    <GrantsSection workspaceId={workspaceId} grants={grants} />
    <PasskeysSection />
    <NotificationsSection />
  </Stack>
);
