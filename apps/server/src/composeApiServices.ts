import type { ApiServices, ApiSettings } from "@work-os/api/ApiServices";
import { createSaveStandard } from "@work-os/core/catalogue/saveStandard";
import { createCreateConnection } from "@work-os/core/connections/createConnection";
import { createAuthenticateSession } from "@work-os/core/identity/authenticateSession";
import { createCompleteSetup } from "@work-os/core/identity/completeSetup";
import { createIssueSession } from "@work-os/core/identity/issueSession";
import { createRegisterPasskey } from "@work-os/core/identity/registerPasskey";
import { createSignInWithPasskey } from "@work-os/core/identity/signInWithPasskey";
import { createSignOut } from "@work-os/core/identity/signOut";
import { createListInbox } from "@work-os/core/inbox/listInbox";
import { createSubscribeToPush } from "@work-os/core/notifications/subscribeToPush";
import { createCreateProject } from "@work-os/core/projects/createProject";
import { createAuthenticateRunner } from "@work-os/core/runners/authenticateRunner";
import { createConnectRunner } from "@work-os/core/runners/connectRunner";
import { createListRunnerFolders } from "@work-os/core/runners/listRunnerFolders";
import { createListRunners } from "@work-os/core/runners/listRunners";
import { createPairRunner } from "@work-os/core/runners/pairRunner";
import { createRecordEgressBlocked } from "@work-os/core/runners/recordEgressBlocked";
import { createCreatePersonalWorkspace } from "@work-os/core/workspaces/createPersonalWorkspace";
import { createRequireMembership } from "@work-os/core/workspaces/requireMembership";

import type { RunOperations } from "./composeRunOperations.ts";
import type { SharedOperations } from "./composeSharedOperations.ts";
import type { ServerContext } from "./ServerContext.ts";

export type ApiServicesInput = {
  readonly context: ServerContext;
  readonly shared: SharedOperations;
  readonly runs: RunOperations;
  readonly settings: ApiSettings;
  readonly readSetupCode: () => string;
};

export const composeApiServices = (input: ApiServicesInput): ApiServices => {
  const { context, shared, runs } = input;
  const { stores, clock, randomSource, logger, eventBus } = context;
  const issueSession = createIssueSession({ ...stores, randomSource, clock });
  const createPersonalWorkspace = createCreatePersonalWorkspace({ ...stores, workspacePackages: context.workspacePackages, randomSource, clock });
  const runnerGateway = context.runnerHub;

  return {
    settings: input.settings,
    clock,
    logger,
    identity: {
      userStore: stores.userStore,
      completeSetup: createCompleteSetup({ ...stores, readSetupCode: input.readSetupCode, createPersonalWorkspace, issueSession, randomSource, clock }),
      authenticateSession: createAuthenticateSession({ ...stores, randomSource, clock }),
      signOut: createSignOut({ ...stores, randomSource }),
      passkeyStore: stores.passkeyStore,
      registerPasskey: createRegisterPasskey({ ...stores, clock }),
      signInWithPasskey: createSignInWithPasskey({ ...stores, issueSession }),
    },
    workspaces: { workspaceStore: stores.workspaceStore, requireMembership: createRequireMembership({ ...stores }) },
    runners: {
      pairingCodes: context.pairingCodes,
      pairRunner: createPairRunner({ ...stores, pairingCodes: context.pairingCodes, eventBus, randomSource, clock }),
      authenticateRunner: createAuthenticateRunner({ ...stores, randomSource }),
      connectRunner: createConnectRunner({ ...stores, runnerHub: context.runnerHub, eventBus, logger, clock }),
      runnerHub: context.runnerHub,
      listRunners: createListRunners({ ...stores, runnerGateway }),
      listRunnerFolders: createListRunnerFolders({ ...stores, runnerGateway }),
      recordEgressBlocked: createRecordEgressBlocked({ ...stores, ...shared }),
    },
    projects: {
      projectStore: stores.projectStore,
      createProject: createCreateProject({ ...stores, workspacePackages: context.workspacePackages, eventBus, randomSource, clock }),
    },
    catalogue: {
      workspacePackages: context.workspacePackages,
      capabilityRegistry: context.capabilityRegistry,
      saveStandard: createSaveStandard({ workspacePackages: context.workspacePackages, eventBus }),
    },
    connections: {
      connectionStore: stores.connectionStore,
      createConnection: createCreateConnection({ ...stores, secretVault: context.secretVault, randomSource, clock }),
    },
    runs: { runStore: stores.runStore, ...runs },
    inbox: { listInbox: createListInbox({ ...stores }), answerInboxItem: runs.answerInboxItem },
    grants: { grantStore: stores.grantStore },
    push: {
      publicKey: context.pushSender.publicKey,
      subscribeToPush: createSubscribeToPush({ ...stores, clock }),
      pushSubscriptionStore: stores.pushSubscriptionStore,
    },
    events: eventBus,
  };
};
