import type { UserId } from "@work-os/domain/identifiers/Identifiers";
import type { NotFoundError } from "@work-os/shared/NotFoundError";
import type { WorkOsError } from "@work-os/shared/WorkOsError";

export type Session = {
  readonly tokenHash: string;
  readonly userId: UserId;
  readonly createdAt: string;
  readonly expiresAt: string;
};

export type SessionStore = {
  readonly createSession: (session: Session) => Promise<Session | WorkOsError>;
  readonly findSession: (tokenHash: string) => Promise<Session | NotFoundError | WorkOsError>;
  readonly deleteSession: (tokenHash: string) => Promise<WorkOsError | undefined>;
};
