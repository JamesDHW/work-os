import type { UserId } from "@work-os/domain/identifiers/Identifiers";

export type PushSubscription = {
  readonly userId: UserId;
  readonly endpoint: string;
  readonly keys: { readonly p256dh: string; readonly auth: string };
  readonly createdAt: string;
};
