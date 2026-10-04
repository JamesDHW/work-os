import { z } from "zod";

import { JsonObjectSchema } from "../common/json.schema.ts";

export const SetupRequestSchema = z
  .object({ setupCode: z.string().min(1), displayName: z.string().min(1).max(100) })
  .meta({ id: "SetupRequest" });

export const AccessTokenResponseSchema = z.object({ token: z.string() }).meta({ id: "AccessTokenResponse" });

export const PasskeyOptionsResponseSchema = z.object({ options: JsonObjectSchema }).meta({ id: "PasskeyOptionsResponse" });

export const PasskeyVerificationRequestSchema = z
  .object({ response: JsonObjectSchema })
  .meta({ id: "PasskeyVerificationRequest" });
