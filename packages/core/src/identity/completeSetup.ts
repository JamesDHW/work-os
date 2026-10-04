import { toUserId } from "@work-os/domain/identifiers/Identifiers";
import type { User } from "@work-os/domain/workspaces/User";
import type { Workspace } from "@work-os/domain/workspaces/Workspace";
import { ConflictError } from "@work-os/shared/ConflictError";
import { ForbiddenError } from "@work-os/shared/ForbiddenError";
import { WorkOsError } from "@work-os/shared/WorkOsError";

import type { RandomSource } from "../system/RandomSource.ts";
import type { SystemClock } from "../system/SystemClock.ts";
import type { CreatePersonalWorkspace } from "../workspaces/createPersonalWorkspace.ts";
import type { IssueSession } from "./issueSession.ts";
import type { UserStore } from "./UserStore.ts";

export type CompleteSetupInput = {
  readonly setupCode: string;
  readonly displayName: string;
};

export type CompletedSetup = {
  readonly user: User;
  readonly workspace: Workspace;
  readonly token: string;
};

type CompleteSetupDependencies = {
  readonly readSetupCode: () => string;
  readonly userStore: Pick<UserStore, "countUsers" | "createUser">;
  readonly createPersonalWorkspace: CreatePersonalWorkspace;
  readonly issueSession: IssueSession;
  readonly randomSource: Pick<RandomSource, "createId">;
  readonly clock: SystemClock;
};

export type CompleteSetup = (input: CompleteSetupInput) => Promise<CompletedSetup | WorkOsError>;

export const createCompleteSetup = (dependencies: CompleteSetupDependencies): CompleteSetup => {
  return async (input) => {
    const userCount = await dependencies.userStore.countUsers();
    if (userCount instanceof WorkOsError) return userCount;
    if (userCount > 0) return new ConflictError("work-os is already set up. Sign in with your passkey.");
    if (input.setupCode !== dependencies.readSetupCode()) return new ForbiddenError("The setup code does not match.");

    const user = await dependencies.userStore.createUser({
      id: toUserId(dependencies.randomSource.createId()),
      displayName: input.displayName,
      createdAt: dependencies.clock.now(),
    });
    if (user instanceof WorkOsError) return user;

    return createWorkspaceAndSession(dependencies, user);
  };
};

const createWorkspaceAndSession = async (
  dependencies: CompleteSetupDependencies,
  user: User,
): Promise<CompletedSetup | WorkOsError> => {
  const workspace = await dependencies.createPersonalWorkspace(user);
  if (workspace instanceof WorkOsError) return workspace;

  const token = await dependencies.issueSession(user.id);
  if (token instanceof WorkOsError) return token;

  return { user, workspace, token };
};
