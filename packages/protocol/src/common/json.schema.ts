import { z } from "zod";

import type { JsonObject, JsonValue } from "@work-os/domain/json/Json";

export const JsonValueSchema: z.ZodType<JsonValue> = z.lazy(() =>
  z.union([z.string(), z.number(), z.boolean(), z.null(), z.array(JsonValueSchema), z.record(z.string(), JsonValueSchema)]),
);

export const JsonObjectSchema: z.ZodType<JsonObject> = z.record(z.string(), JsonValueSchema);
