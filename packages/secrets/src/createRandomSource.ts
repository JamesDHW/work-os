import type { RandomSource } from "@work-os/core/system/RandomSource";
import { createHash, randomBytes, randomInt, randomUUID } from "crypto";

import { PAIRING_CODE_ALPHABET, PAIRING_CODE_GROUP_LENGTH, TOKEN_BYTES } from "./secrets.constants.ts";

export const createRandomSource = (): RandomSource => ({
  createId: () => randomUUID(),
  createToken: () => randomBytes(TOKEN_BYTES).toString("base64url"),
  createPairingCode: () => `${createCodeGroup()}-${createCodeGroup()}`,
  hashToken: (token) => createHash("sha256").update(token).digest("hex"),
});

const createCodeGroup = (): string => {
  const characters = Array.from({ length: PAIRING_CODE_GROUP_LENGTH }, () => PAIRING_CODE_ALPHABET.charAt(randomInt(PAIRING_CODE_ALPHABET.length)));
  return characters.join("");
};
