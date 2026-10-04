import { defineExtension } from "@work-os/sdk/defineExtension";

import { createPullRequestCapability } from "./createPullRequestCapability.ts";
import { pushBranchCapability } from "./pushBranchCapability.ts";
import { readRepositoryCapability } from "./readRepositoryCapability.ts";

export const extension = defineExtension({
  name: "github",
  capabilities: [readRepositoryCapability, createPullRequestCapability, pushBranchCapability],
});
