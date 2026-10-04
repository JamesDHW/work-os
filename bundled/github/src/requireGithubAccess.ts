import { CapabilityError } from "@work-os/sdk/CapabilityError";

import { REPOSITORY_PATTERN } from "./github.constants.ts";

export type GithubAccess = {
  readonly repository: string;
  readonly secret: string;
};

export const requireGithubAccess = (target: string, secret: string | null): GithubAccess | CapabilityError => {
  if (!REPOSITORY_PATTERN.test(target)) return new CapabilityError(`Target must be a repository such as owner/name, not "${target}".`);
  if (secret === null) return new CapabilityError("Add a GitHub connection in Settings before using GitHub capabilities.");

  return { repository: target, secret };
};
