import type { UserId } from "@work-os/domain/identifiers/Identifiers";
import type { User } from "@work-os/domain/workspaces/User";
import type { NotFoundError } from "@work-os/shared/NotFoundError";
import type { WorkOsError } from "@work-os/shared/WorkOsError";

export type UserStore = {
  readonly countUsers: () => Promise<number | WorkOsError>;
  readonly createUser: (user: User) => Promise<User | WorkOsError>;
  readonly findUser: (userId: UserId) => Promise<User | NotFoundError | WorkOsError>;
};
