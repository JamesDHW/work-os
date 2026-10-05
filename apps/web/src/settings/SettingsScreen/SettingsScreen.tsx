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

export const SettingsScreen: FC<SettingsScreenProps> = (props) => (
  <Stack gap="lg">
    <PageHeader title="Settings" description="Machines, connections, approvals and this device." />
    <MachinesSection workspaceId={props.workspaceId} runners={props.runners} />
    <ConnectionsSection workspaceId={props.workspaceId} connections={props.connections} capabilities={props.capabilities} />
    <GrantsSection workspaceId={props.workspaceId} grants={props.grants} />
    <PasskeysSection />
    <NotificationsSection />
  </Stack>
);
