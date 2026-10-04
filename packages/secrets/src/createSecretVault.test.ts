import { describe, expect, it } from "vitest";

import { WorkOsError } from "@work-os/shared/WorkOsError";

import { createSecretVault } from "./createSecretVault.ts";

const randomKey = (): Buffer => Buffer.from(crypto.getRandomValues(new Uint8Array(32)));

describe("createSecretVault", () => {
  it("opens what it sealed", async () => {
    const vault = createSecretVault(randomKey());
    const sealed = await vault.sealSecret("ghp_example");
    if (sealed instanceof WorkOsError) return expect.unreachable(sealed.message);

    expect(sealed).not.toContain("ghp_example");
    expect(await vault.openSecret(sealed)).toBe("ghp_example");
  });

  it("refuses to open a secret sealed with another key", async () => {
    const sealed = await createSecretVault(randomKey()).sealSecret("ghp_example");
    if (sealed instanceof WorkOsError) return expect.unreachable(sealed.message);

    expect(await createSecretVault(randomKey()).openSecret(sealed)).toBeInstanceOf(WorkOsError);
  });
});
