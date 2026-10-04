import type { CapabilityRegistry } from "@work-os/core/capabilities/CapabilityRegistry";
import type { GrantStore } from "@work-os/core/capabilities/GrantStore";
import type { SaveStandard } from "@work-os/core/catalogue/saveStandard";
import type { WorkspacePackages } from "@work-os/core/catalogue/WorkspacePackages";
import type { ConnectionStore } from "@work-os/core/connections/ConnectionStore";
import type { CreateConnection } from "@work-os/core/connections/createConnection";
import type { EventBus } from "@work-os/core/events/EventBus";
import type { AuthenticateSession } from "@work-os/core/identity/authenticateSession";
import type { CompleteSetup } from "@work-os/core/identity/completeSetup";
import type { PasskeyStore } from "@work-os/core/identity/PasskeyStore";
import type { RegisterPasskey } from "@work-os/core/identity/registerPasskey";
import type { SignInWithPasskey } from "@work-os/core/identity/signInWithPasskey";
import type { SignOut } from "@work-os/core/identity/signOut";
import type { UserStore } from "@work-os/core/identity/UserStore";
import type { AnswerInboxItem } from "@work-os/core/inbox/answerInboxItem";
import type { ListInbox } from "@work-os/core/inbox/listInbox";
import type { PushSubscriptionStore } from "@work-os/core/notifications/PushSubscriptionStore";
import type { SubscribeToPush } from "@work-os/core/notifications/subscribeToPush";
import type { CreateProject } from "@work-os/core/projects/createProject";
import type { ProjectStore } from "@work-os/core/projects/ProjectStore";
import type { AuthenticateRunner } from "@work-os/core/runners/authenticateRunner";
import type { ConnectRunner } from "@work-os/core/runners/connectRunner";
import type { ListRunnerFolders } from "@work-os/core/runners/listRunnerFolders";
import type { ListRunners } from "@work-os/core/runners/listRunners";
import type { PairingCodes } from "@work-os/core/runners/PairingCodes";
import type { PairRunner } from "@work-os/core/runners/pairRunner";
import type { RecordEgressBlocked } from "@work-os/core/runners/recordEgressBlocked";
import type { RunnerHub } from "@work-os/core/runners/RunnerHub";
import type { AddRunCapability } from "@work-os/core/runs/addRunCapability";
import type { GetRunDetail } from "@work-os/core/runs/getRunDetail";
import type { RunStore } from "@work-os/core/runs/RunStore";
import type { SendRunMessage } from "@work-os/core/runs/sendRunMessage";
import type { StartRun } from "@work-os/core/runs/startRun";
import type { StopRun } from "@work-os/core/runs/stopRun";
import type { Logger } from "@work-os/core/system/Logger";
import type { SystemClock } from "@work-os/core/system/SystemClock";
import type { RequireMembership } from "@work-os/core/workspaces/requireMembership";
import type { WorkspaceStore } from "@work-os/core/workspaces/WorkspaceStore";

export type ApiSettings = {
  readonly publicOrigin: string;
  readonly relyingPartyId: string;
  readonly relyingPartyName: string;
  readonly isSecureCookie: boolean;
  readonly serverVersion: string;
};

export type ApiServices = {
  readonly settings: ApiSettings;
  readonly clock: SystemClock;
  readonly logger: Logger;
  readonly identity: {
    readonly userStore: Pick<UserStore, "countUsers">;
    readonly completeSetup: CompleteSetup;
    readonly authenticateSession: AuthenticateSession;
    readonly signOut: SignOut;
    readonly passkeyStore: Pick<PasskeyStore, "listPasskeysForUser">;
    readonly registerPasskey: RegisterPasskey;
    readonly signInWithPasskey: SignInWithPasskey;
  };
  readonly workspaces: {
    readonly workspaceStore: Pick<WorkspaceStore, "listWorkspacesForUser">;
    readonly requireMembership: RequireMembership;
  };
  readonly runners: {
    readonly pairingCodes: Pick<PairingCodes, "issuePairingCode">;
    readonly pairRunner: PairRunner;
    readonly authenticateRunner: AuthenticateRunner;
    readonly connectRunner: ConnectRunner;
    readonly runnerHub: Pick<RunnerHub, "receive">;
    readonly listRunners: ListRunners;
    readonly listRunnerFolders: ListRunnerFolders;
    readonly recordEgressBlocked: RecordEgressBlocked;
  };
  readonly projects: {
    readonly projectStore: Pick<ProjectStore, "listProjects" | "findProject">;
    readonly createProject: CreateProject;
  };
  readonly catalogue: {
    readonly workspacePackages: Pick<WorkspacePackages, "listStandards" | "readStandard" | "listAgents" | "listEnvironments">;
    readonly capabilityRegistry: Pick<CapabilityRegistry, "listCapabilities">;
    readonly saveStandard: SaveStandard;
  };
  readonly connections: {
    readonly connectionStore: Pick<ConnectionStore, "listConnections" | "deleteConnection">;
    readonly createConnection: CreateConnection;
  };
  readonly runs: {
    readonly runStore: Pick<RunStore, "listRuns">;
    readonly startRun: StartRun;
    readonly getRunDetail: GetRunDetail;
    readonly sendRunMessage: SendRunMessage;
    readonly stopRun: StopRun;
    readonly addRunCapability: AddRunCapability;
  };
  readonly inbox: {
    readonly listInbox: ListInbox;
    readonly answerInboxItem: AnswerInboxItem;
  };
  readonly grants: {
    readonly grantStore: Pick<GrantStore, "listGrants" | "revokeGrant">;
  };
  readonly push: {
    readonly publicKey: string;
    readonly subscribeToPush: SubscribeToPush;
    readonly pushSubscriptionStore: Pick<PushSubscriptionStore, "deletePushSubscription">;
  };
  readonly events: Pick<EventBus, "subscribe">;
};
