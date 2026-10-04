import { defineExtension } from "@work-os/sdk/defineExtension";

import { readStandardCapability } from "./readStandardCapability.ts";
import { saveStandardCapability } from "./saveStandardCapability.ts";

export const extension = defineExtension({
  name: "base",
  capabilities: [readStandardCapability, saveStandardCapability],
});
