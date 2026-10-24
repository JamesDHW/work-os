import { DEFAULT_PROFILE } from "@work-os/config/config.constants";
import { isProfileName, profilePaths, type ProfilePaths } from "@work-os/config/ProfilePaths";
import { InvalidRequestError } from "@work-os/shared/InvalidRequestError";
import type { WorkOsError } from "@work-os/shared/WorkOsError";

export type ResolveProfileInput = {
  readonly flag: string | undefined;
  readonly environment: Readonly<Record<string, string | undefined>>;
  readonly homeDirectory: string;
  readonly fallback: string | undefined;
};

/** The profile a command works on: --profile, then WORK_OS_PROFILE, then the command's own default. */
export const resolveProfile = (input: ResolveProfileInput): ProfilePaths | WorkOsError => {
  const name = input.flag ?? input.environment["WORK_OS_PROFILE"] ?? input.fallback ?? DEFAULT_PROFILE;
  if (!isProfileName(name)) return new InvalidRequestError(`"${name}" is not a profile name. Use lowercase letters, digits and hyphens.`);
  return profilePaths(input.homeDirectory, name);
};
