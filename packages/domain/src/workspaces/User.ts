import type { UserId } from "../identifiers/Identifiers.ts";

export type User = {
  readonly id: UserId;
  readonly displayName: string;
  readonly createdAt: string;
};
