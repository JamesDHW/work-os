import type { JsonObject } from "@work-os/domain/json/Json";
import { JsonObjectSchema } from "@work-os/protocol/common/json.schema";
import { InvalidRequestError } from "@work-os/shared/InvalidRequestError";
import { tryCatch } from "@work-os/shared/tryCatch";
import { WorkOsError } from "@work-os/shared/WorkOsError";

export const toJsonObject = (value: object): JsonObject | WorkOsError => {
  const serialized = tryCatch((): unknown => JSON.parse(JSON.stringify(value)));
  if (serialized instanceof WorkOsError) return serialized;

  const parsed = JsonObjectSchema.safeParse(serialized);
  if (!parsed.success) return new InvalidRequestError("The value is not a JSON object.");
  return parsed.data;
};
