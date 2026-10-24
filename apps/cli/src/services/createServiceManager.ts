import { InvalidRequestError } from "@work-os/shared/InvalidRequestError";
import type { WorkOsError } from "@work-os/shared/WorkOsError";

import { createLaunchdManager } from "./createLaunchdManager.ts";
import { createSystemdManager } from "./createSystemdManager.ts";
import type { ServiceManager } from "./ServiceManager.ts";

export type ServiceManagerInput = {
  readonly platform: string;
  readonly homeDirectory: string;
  readonly userId: number | undefined;
};

export const createServiceManager = (input: ServiceManagerInput): ServiceManager | WorkOsError => {
  switch (input.platform) {
    case "darwin":
      return createLaunchdManager({ homeDirectory: input.homeDirectory, userId: input.userId ?? 0 });
    case "linux":
      return createSystemdManager({ homeDirectory: input.homeDirectory });
    default:
      return new InvalidRequestError(`work-os services support macOS and Linux, not ${input.platform}.`);
  }
};
