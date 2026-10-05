import { describe, expect, it } from "vitest";

import { toPushSubscriptionBody } from "./toPushSubscriptionBody.ts";

describe("toPushSubscriptionBody", () => {
  it("keeps the endpoint and both keys", () => {
    const body = toPushSubscriptionBody({ endpoint: "https://push.example/1", keys: { p256dh: "key", auth: "secret" } });

    expect(body).toEqual({ endpoint: "https://push.example/1", keys: { p256dh: "key", auth: "secret" } });
  });

  it("rejects a subscription without keys", () => {
    expect(toPushSubscriptionBody({ endpoint: "https://push.example/1" })).toBeNull();
  });
});
