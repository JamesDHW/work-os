import type { SecretVault } from "@work-os/core/connections/SecretVault";
import { tryCatch } from "@work-os/shared/tryCatch";
import { WorkOsError } from "@work-os/shared/WorkOsError";
import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

import { CIPHER_ALGORITHM, IV_BYTES, SEALED_SECRET_VERSION } from "./secrets.constants.ts";

export class SealedSecretFormatError extends WorkOsError {}

export const createSecretVault = (masterKey: Buffer): SecretVault => ({
  sealSecret: async (secret) => tryCatch(() => sealWithKey(masterKey, secret)),
  openSecret: async (sealedSecret) => openWithKey(masterKey, sealedSecret),
});

const sealWithKey = (masterKey: Buffer, secret: string): string => {
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv(CIPHER_ALGORITHM, masterKey, iv);
  const ciphertext = Buffer.concat([cipher.update(secret, "utf8"), cipher.final()]);
  const parts = [SEALED_SECRET_VERSION, iv, cipher.getAuthTag(), ciphertext].map(encodePart);
  return parts.join(".");
};

const openWithKey = (masterKey: Buffer, sealedSecret: string): string | WorkOsError => {
  const [version, iv, authTag, ciphertext] = sealedSecret.split(".");
  const isWellFormed = version === SEALED_SECRET_VERSION && iv !== undefined && authTag !== undefined && ciphertext !== undefined;
  if (!isWellFormed) return new SealedSecretFormatError("The stored secret is not in a format this version can read.");

  return tryCatch(() => {
    const decipher = createDecipheriv(CIPHER_ALGORITHM, masterKey, Buffer.from(iv, "base64url"));
    decipher.setAuthTag(Buffer.from(authTag, "base64url"));
    return Buffer.concat([decipher.update(Buffer.from(ciphertext, "base64url")), decipher.final()]).toString("utf8");
  });
};

const encodePart = (part: string | Buffer): string => (typeof part === "string" ? part : part.toString("base64url"));
