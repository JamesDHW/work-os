import { WILDCARD_PREFIX } from "./isHostAllowed.constants.ts";

export const isHostAllowed = (host: string, allowlist: readonly string[]): boolean => {
  const normalizedHost = host.toLowerCase();
  return allowlist.some((allowedHost) => isHostMatch(normalizedHost, allowedHost.toLowerCase()));
};

const isHostMatch = (host: string, allowedHost: string): boolean => {
  if (!allowedHost.startsWith(WILDCARD_PREFIX)) return host === allowedHost;

  const parentDomain = allowedHost.slice(WILDCARD_PREFIX.length);
  return host.endsWith(`.${parentDomain}`);
};
