import type { FC } from "react";

import type { Capability, Connection, Grant, Runner } from "../../api/apiTypes.ts";
import { ConnectionsSection } from "../../connections/ConnectionsSection/ConnectionsSection.tsx";
import { PasskeysSection } from "../../identity/PasskeysSection/PasskeysSection.tsx";
import { PageHeader } from "../../ui/PageHeader/PageHeader.tsx";
import { Stack } from "../../ui/Stack/Stack.tsx";
import { GrantsSection } from "../GrantsSection/GrantsSection.tsx";
import { MachinesSection } from "../MachinesSection/MachinesSection.tsx";
import { NotificationsSection } from "../NotificationsSection/NotificationsSection.tsx";

export type SettingsScreenProps = {
  readonly workspaceId: string;
  readonly runners: readonly Runner[];
  readonly connections: readonly Connection[];
  readonly capabilities: readonly Capability[];
  readonly grants: readonly Grant[];
};

export const SettingsScreen: FC<SettingsScreenProps> = ({ workspaceId, runners, connections, capabilities, grants }) => (
  <Stack gap="lg">
    <PageHeader title="Settings" description="Machines, connections, approvals and this device." />
    <MachinesSection workspaceId={workspaceId} runners={runners} />
    <ConnectionsSection workspaceId={workspaceId} connections={connections} capabilities={capabilities} />
    <GrantsSection workspaceId={workspaceId} grants={grants} />
    <PasskeysSection />
    <NotificationsSection />
  </Stack>
);
