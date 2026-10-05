import type { PublicKeyCredentialCreationOptionsJSON, PublicKeyCredentialRequestOptionsJSON } from "@simplewebauthn/browser";

export const isCreationOptions = (value: unknown): value is PublicKeyCredentialCreationOptionsJSON => {
  const hasFields = typeof value === "object" && value !== null && "challenge" in value && "rp" in value && "user" in value;
  return hasFields && typeof value.challenge === "string";
};

export const isRequestOptions = (value: unknown): value is PublicKeyCredentialRequestOptionsJSON => {
  const hasChallenge = typeof value === "object" && value !== null && "challenge" in value;
  return hasChallenge && typeof value.challenge === "string";
};
