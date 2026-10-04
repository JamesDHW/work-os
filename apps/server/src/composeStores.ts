import type { CapabilityCallStore } from "@work-os/core/capabilities/CapabilityCallStore";
import type { GrantStore } from "@work-os/core/capabilities/GrantStore";
import type { ConnectionStore } from "@work-os/core/connections/ConnectionStore";
import type { PasskeyStore } from "@work-os/core/identity/PasskeyStore";
import type { SessionStore } from "@work-os/core/identity/SessionStore";
import type { UserStore } from "@work-os/core/identity/UserStore";
import type { InboxStore } from "@work-os/core/inbox/InboxStore";
import type { PushSubscriptionStore } from "@work-os/core/notifications/PushSubscriptionStore";
import type { ObservationStore } from "@work-os/core/observations/ObservationStore";
import type { ProjectStore } from "@work-os/core/projects/ProjectStore";
import type { RunnerStore } from "@work-os/core/runners/RunnerStore";
import type { RunStore } from "@work-os/core/runs/RunStore";
import type { SettingsStore } from "@work-os/core/system/SettingsStore";
import type { WorkspaceStore } from "@work-os/core/workspaces/WorkspaceStore";
import type { WorkOsDatabase } from "@work-os/db/WorkOsDatabase";
import { createCapabilityCallStore } from "@work-os/db/capabilities/createCapabilityCallStore";
import { createGrantStore } from "@work-os/db/capabilities/createGrantStore";
import { createConnectionStore } from "@work-os/db/connections/createConnectionStore";
import { createPasskeyStore } from "@work-os/db/identity/createPasskeyStore";
import { createSessionStore } from "@work-os/db/identity/createSessionStore";
import { createUserStore } from "@work-os/db/identity/createUserStore";
import { createInboxStore } from "@work-os/db/inbox/createInboxStore";
import { createPushSubscriptionStore } from "@work-os/db/notifications/createPushSubscriptionStore";
import { createObservationStore } from "@work-os/db/observations/createObservationStore";
import { createProjectStore } from "@work-os/db/projects/createProjectStore";
import { createRunnerStore } from "@work-os/db/runners/createRunnerStore";
import { createRunStore } from "@work-os/db/runs/createRunStore";
import { createSettingsStore } from "@work-os/db/system/createSettingsStore";
import { createWorkspaceStore } from "@work-os/db/workspaces/createWorkspaceStore";

export type Stores = {
  readonly userStore: UserStore;
  readonly sessionStore: SessionStore;
  readonly passkeyStore: PasskeyStore;
  readonly workspaceStore: WorkspaceStore;
  readonly runnerStore: RunnerStore;
  readonly projectStore: ProjectStore;
  readonly runStore: RunStore;
  readonly inboxStore: InboxStore;
  readonly grantStore: GrantStore;
  readonly capabilityCallStore: CapabilityCallStore;
  readonly connectionStore: ConnectionStore;
  readonly pushSubscriptionStore: PushSubscriptionStore;
  readonly observationStore: ObservationStore;
  readonly settingsStore: SettingsStore;
};

export const composeStores = (database: WorkOsDatabase): Stores => ({
  userStore: createUserStore(database),
  sessionStore: createSessionStore(database),
  passkeyStore: createPasskeyStore(database),
  workspaceStore: createWorkspaceStore(database),
  runnerStore: createRunnerStore(database),
  projectStore: createProjectStore(database),
  runStore: createRunStore(database),
  inboxStore: createInboxStore(database),
  grantStore: createGrantStore(database),
  capabilityCallStore: createCapabilityCallStore(database),
  connectionStore: createConnectionStore(database),
  pushSubscriptionStore: createPushSubscriptionStore(database),
  observationStore: createObservationStore(database),
  settingsStore: createSettingsStore(database),
});
