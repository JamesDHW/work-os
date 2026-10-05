import { describe, expect, it } from "vitest";

import { toWorkspaceId } from "@work-os/domain/identifiers/Identifiers";
import { NotFoundError } from "@work-os/shared/NotFoundError";

import { createPairingCodes } from "./pairingCodes.state.ts";

const workspaceId = toWorkspaceId("workspace-1");

const createCodes = (times: readonly string[]) => {
  const clockReadings = [...times];
  const now = (): string => clockReadings.shift() ?? "2026-10-04T12:00:00.000Z";
  return createPairingCodes({ randomSource: { createPairingCode: () => "ABCD-1234" }, clock: { now } });
};

describe("createPairingCodes", () => {
  it("redeems a fresh code once", () => {
    const pairingCodes = createCodes(["2026-10-04T10:00:00.000Z", "2026-10-04T10:01:00.000Z"]);
    const issued = pairingCodes.issuePairingCode(workspaceId);

    expect(pairingCodes.redeemPairingCode(issued.code)).toBe(workspaceId);
    expect(pairingCodes.redeemPairingCode(issued.code)).toBeInstanceOf(NotFoundError);
  });

  it("refuses an expired code", () => {
    const pairingCodes = createCodes(["2026-10-04T10:00:00.000Z", "2026-10-04T10:30:00.000Z"]);
    const issued = pairingCodes.issuePairingCode(workspaceId);

    expect(pairingCodes.redeemPairingCode(issued.code)).toBeInstanceOf(NotFoundError);
  });
});
