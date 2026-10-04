import type { User } from "@work-os/domain/workspaces/User";
import type { Workspace } from "@work-os/domain/workspaces/Workspace";

export type ApiEnv = {
  readonly Variables: {
    readonly user: User;
    readonly sessionToken: string;
    readonly workspace: Workspace;
  };
};
