import type { PushKeys } from "@work-os/core/notifications/PushKeys";
import { PushKeysSchema } from "@work-os/protocol/api/push.schema";
import { parseWithSchema } from "@work-os/protocol/common/parseWithSchema";
import type { WorkOsError } from "@work-os/shared/WorkOsError";
import { tryCatch } from "@work-os/shared/tryCatch";

export const parsePushKeys = (serialized: string): PushKeys | WorkOsError => {
  return parseWithSchema(PushKeysSchema, tryCatch((): unknown => JSON.parse(serialized)), "Stored push keys");
};
