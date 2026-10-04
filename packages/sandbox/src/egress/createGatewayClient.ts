import { BlockedEgressReportSchema } from "@work-os/protocol/egress/egressControl.schema";
import { tryCatchAsync } from "@work-os/shared/tryCatch";
import { WorkOsError } from "@work-os/shared/WorkOsError";

import type { BlockedEgress } from "./EgressController.ts";

export type GatewayClient = {
  readonly isHealthy: () => Promise<boolean>;
  readonly putAllowlist: (body: object) => Promise<WorkOsError | undefined>;
  readonly deleteAllowlist: (sourceIp: string) => Promise<WorkOsError | undefined>;
  readonly drainBlocked: () => Promise<readonly BlockedEgress[] | WorkOsError>;
};

export class GatewayRequestError extends WorkOsError {}

export const createGatewayClient = (baseUrl: string, token: string): GatewayClient => {
  const send = async (method: string, path: string, body?: object): Promise<Response | WorkOsError> => {
    const init = { method, headers: { authorization: `Bearer ${token}`, "content-type": "application/json" } };
    const response = await tryCatchAsync(() => fetch(`${baseUrl}${path}`, body === undefined ? init : { ...init, body: JSON.stringify(body) }));
    if (response instanceof WorkOsError) return response;
    if (!response.ok) return new GatewayRequestError(`Egress gateway answered ${response.status} to ${method} ${path}.`);
    return response;
  };
  const toVoid = (response: Response | WorkOsError): WorkOsError | undefined => (response instanceof WorkOsError ? response : undefined);

  return {
    isHealthy: async () => !((await send("GET", "/health")) instanceof WorkOsError),
    putAllowlist: async (body) => toVoid(await send("PUT", "/allowlists", body)),
    deleteAllowlist: async (sourceIp) => toVoid(await send("DELETE", "/allowlists", { sourceIp })),
    drainBlocked: async () => {
      const response = await send("POST", "/blocked/drain");
      if (response instanceof WorkOsError) return response;

      const report = BlockedEgressReportSchema.safeParse(await tryCatchAsync((): Promise<unknown> => response.json()));
      if (!report.success) return new GatewayRequestError("The egress gateway sent an invalid report.");
      return report.data.blocked;
    },
  };
};
