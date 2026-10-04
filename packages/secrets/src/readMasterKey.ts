import { Entry } from "@napi-rs/keyring";
import { InvalidRequestError } from "@work-os/shared/InvalidRequestError";
import { tryCatch } from "@work-os/shared/tryCatch";
import { WorkOsError } from "@work-os/shared/WorkOsError";
import { randomBytes } from "crypto";

import { KEYRING_MASTER_KEY_ACCOUNT, KEYRING_SERVICE, MASTER_KEY_BYTES } from "./secrets.constants.ts";

export type MasterKeySource =
  | { readonly kind: "environment"; readonly encodedKey: string }
  | { readonly kind: "keychain" };

export const readMasterKey = (source: MasterKeySource): Buffer | WorkOsError => {
  switch (source.kind) {
    case "environment":
      return decodeKey(source.encodedKey);
    case "keychain":
      return readOrCreateKeychainKey();
    default:
      return source satisfies never;
  }
};

const readOrCreateKeychainKey = (): Buffer | WorkOsError => {
  const entry = tryCatch(() => new Entry(KEYRING_SERVICE, KEYRING_MASTER_KEY_ACCOUNT));
  if (entry instanceof WorkOsError) return entry;

  const stored = tryCatch(() => entry.getPassword());
  if (stored instanceof WorkOsError) return stored;
  if (stored !== null) return decodeKey(stored);

  const created = randomBytes(MASTER_KEY_BYTES).toString("base64");
  const saved = tryCatch(() => entry.setPassword(created));
  if (saved instanceof WorkOsError) return saved;

  return decodeKey(created);
};

const decodeKey = (encodedKey: string): Buffer | WorkOsError => {
  const key = Buffer.from(encodedKey, "base64");
  if (key.length !== MASTER_KEY_BYTES) return new InvalidRequestError(`The master key must be ${MASTER_KEY_BYTES} bytes, base64-encoded.`);

  return key;
};
