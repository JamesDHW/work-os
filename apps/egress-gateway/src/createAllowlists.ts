import { isHostAllowed } from "@work-os/domain/egress/isHostAllowed";
import type { RunId } from "@work-os/domain/identifiers/Identifiers";

import { ALLOWED_PORTS, BLOCKED_REPORT_LIMIT, IPV4_MAPPED_PREFIX } from "./gateway.constants.ts";

export type BlockedRequest = {
  readonly runId: RunId;
  readonly host: string;
};

export type EgressDecision = { readonly isAllowed: true } | { readonly isAllowed: false; readonly reason: string };

export type Allowlists = {
  readonly set: (sourceIp: string, runId: RunId, hosts: readonly string[]) => void;
  readonly remove: (sourceIp: string) => void;
  readonly decide: (sourceIp: string, host: string, port: number) => EgressDecision;
  readonly drainBlocked: () => readonly BlockedRequest[];
};

type RunAllowlist = {
  readonly runId: RunId;
  readonly hosts: readonly string[];
};

export const createAllowlists = (): Allowlists => {
  const allowlists = new Map<string, RunAllowlist>();
  const blocked: BlockedRequest[] = [];

  const recordBlocked = (request: BlockedRequest): void => {
    blocked.push(request);
    blocked.splice(0, Math.max(0, blocked.length - BLOCKED_REPORT_LIMIT));
  };

  return {
    set: (sourceIp, runId, hosts) => {
      allowlists.set(normalizeIp(sourceIp), { runId, hosts });
    },
    remove: (sourceIp) => {
      allowlists.delete(normalizeIp(sourceIp));
    },
    decide: (sourceIp, host, port) => {
      const allowlist = allowlists.get(normalizeIp(sourceIp));
      if (allowlist === undefined) return { isAllowed: false, reason: "This container is not registered with the gateway." };
      if (!ALLOWED_PORTS.includes(port)) return { isAllowed: false, reason: `Port ${port} is not allowed.` };

      if (isHostAllowed(host, allowlist.hosts)) return { isAllowed: true };
      recordBlocked({ runId: allowlist.runId, host });
      return { isAllowed: false, reason: `${host} is not on this run's egress allowlist.` };
    },
    drainBlocked: () => blocked.splice(0),
  };
};

const normalizeIp = (sourceIp: string): string => (sourceIp.startsWith(IPV4_MAPPED_PREFIX) ? sourceIp.slice(IPV4_MAPPED_PREFIX.length) : sourceIp);
