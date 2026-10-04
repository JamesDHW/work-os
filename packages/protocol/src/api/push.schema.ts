import { z } from "zod";

export const PushSubscriptionSchema = z
  .object({
    endpoint: z.url(),
    keys: z.object({ p256dh: z.string().min(1), auth: z.string().min(1) }),
  })
  .meta({ id: "PushSubscription" });

export const PushPublicKeyResponseSchema = z.object({ publicKey: z.string() }).meta({ id: "PushPublicKeyResponse" });

export const DeletePushSubscriptionRequestSchema = z
  .object({ endpoint: z.url() })
  .meta({ id: "DeletePushSubscriptionRequest" });

export const PushKeysSchema = z.object({ publicKey: z.string().min(1), privateKey: z.string().min(1) });
