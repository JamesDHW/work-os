import { z } from "zod";

import { OpaqueJsonObjectSchema } from "../common/json.schema.ts";

const base64Url = z.string().min(1);
const TransportSchema = z.enum(["ble", "cable", "hybrid", "internal", "nfc", "smart-card", "usb"]);

export const SetupRequestSchema = z
  .object({ setupCode: z.string().min(1), displayName: z.string().min(1).max(100) })
  .meta({ id: "SetupRequest" });

export const SetupStatusResponseSchema = z.object({ isSetUp: z.boolean() }).meta({ id: "SetupStatusResponse" });

export const PasskeyOptionsResponseSchema = z.object({ options: OpaqueJsonObjectSchema }).meta({ id: "PasskeyOptionsResponse" });

export const RegistrationResponseSchema = z.object({
  id: base64Url,
  rawId: base64Url,
  response: z.object({
    clientDataJSON: base64Url,
    attestationObject: base64Url,
    authenticatorData: base64Url.exactOptional(),
    transports: z.array(TransportSchema).exactOptional(),
    publicKeyAlgorithm: z.number().exactOptional(),
    publicKey: base64Url.exactOptional(),
  }),
  authenticatorAttachment: z.enum(["cross-platform", "platform"]).exactOptional(),
  clientExtensionResults: z.object({}),
  type: z.literal("public-key"),
});

export const AuthenticationResponseSchema = z.object({
  id: base64Url,
  rawId: base64Url,
  response: z.object({
    clientDataJSON: base64Url,
    authenticatorData: base64Url,
    signature: base64Url,
    userHandle: base64Url.exactOptional(),
  }),
  authenticatorAttachment: z.enum(["cross-platform", "platform"]).exactOptional(),
  clientExtensionResults: z.object({}),
  type: z.literal("public-key"),
});

export const PasskeyRegistrationRequestSchema = z
  .object({ response: RegistrationResponseSchema })
  .meta({ id: "PasskeyRegistrationRequest" });

export const PasskeySignInRequestSchema = z
  .object({ response: AuthenticationResponseSchema })
  .meta({ id: "PasskeySignInRequest" });

export const OkResponseSchema = z.object({ ok: z.literal(true) }).meta({ id: "OkResponse" });
