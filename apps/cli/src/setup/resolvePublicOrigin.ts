import { tryCatch } from "@work-os/shared/tryCatch";
import { WorkOsError } from "@work-os/shared/WorkOsError";

import type { Exposure } from "../parseCommandLine.ts";
import { runCommand } from "../runCommand.ts";
import { writeLine } from "../writeLine.ts";

export type PublicOriginInput = {
  readonly origin: string | undefined;
  readonly exposure: Exposure | undefined;
  readonly current: string | undefined;
  readonly port: number;
};

/**
 * The address people open work-os at. Passkeys are bound to it, so an address that is already set is kept
 * unless --origin or --expose asks for a change. --expose tailscale publishes the port on the tailnet and
 * uses the machine's tailnet name over HTTPS, which lets phones sign in with passkeys.
 */
export const resolvePublicOrigin = async (input: PublicOriginInput): Promise<string | WorkOsError> => {
  if (input.origin !== undefined) return normalizeOrigin(input.origin);

  const localhost = `http://localhost:${input.port}`;
  switch (input.exposure) {
    case "tailscale":
      return exposeWithTailscale(input.port);
    case "none":
      return localhost;
    case undefined:
      return input.current ?? localhost;
    default:
      return input.exposure satisfies never;
  }
};

const normalizeOrigin = (origin: string): string | WorkOsError => {
  const url = tryCatch(() => new URL(origin));
  if (url instanceof WorkOsError) return new WorkOsError(`"${origin}" is not a URL.`);
  return url.origin;
};

const exposeWithTailscale = async (port: number): Promise<string | WorkOsError> => {
  const served = await runCommand("tailscale", ["serve", "--bg", String(port)]);
  if (served instanceof WorkOsError) return new WorkOsError("Tailscale is not installed, or its command line is not on the PATH. Install it from tailscale.com, or pass --origin.");
  if (served.exitCode !== 0) return new WorkOsError(`tailscale serve failed: ${served.output}`);

  const status = await runCommand("tailscale", ["status", "--json"]);
  if (status instanceof WorkOsError) return status;

  const dnsName = tailnetName(status.output);
  if (dnsName === undefined) return new WorkOsError("Tailscale did not report this machine's tailnet name. Is it signed in?");

  writeLine(`Tailscale serves the server at https://${dnsName} (tailnet only).`);
  return `https://${dnsName}`;
};

const tailnetName = (statusJson: string): string | undefined => {
  const parsed = tryCatch((): unknown => JSON.parse(statusJson));
  if (!isStatus(parsed)) return undefined;

  const { DNSName } = parsed.Self;
  const isName = typeof DNSName === "string" && DNSName.length > 1;
  return isName ? DNSName.replace(/\.$/u, "") : undefined;
};

const isStatus = (value: unknown): value is { readonly Self: Readonly<Record<string, unknown>> } =>
  typeof value === "object" && value !== null && "Self" in value && typeof value.Self === "object" && value.Self !== null;
