import { OpaqueJsonObjectSchema } from "@work-os/protocol/common/json.schema";
import { tryCatch } from "@work-os/shared/tryCatch";

export type OpaqueJson = Record<string, unknown>;

export const toOpaqueJson = (value: object): OpaqueJson => {
  const parsed = OpaqueJsonObjectSchema.safeParse(tryCatch((): unknown => JSON.parse(JSON.stringify(value))));
  if (!parsed.success) return {};

  return parsed.data;
};
