import type { paths } from "@work-os/api-types/apiSchema";
import { tryCatchAsync } from "@work-os/shared/tryCatch";
import { WorkOsError } from "@work-os/shared/WorkOsError";
import createClient from "openapi-fetch";

import type { DoctorCheck } from "./DoctorCheck.ts";

export const checkServer = async (serverUrl: string): Promise<DoctorCheck> => {
  const client = createClient<paths>({ baseUrl: serverUrl });
  const setupStatus = await tryCatchAsync(async () => client.GET("/api/setup"));
  if (setupStatus instanceof WorkOsError) return { name: "Server", status: "fail", detail: `not reachable at ${serverUrl}. Start it with: work-os start server` };
  if (setupStatus.data === undefined) return { name: "Server", status: "fail", detail: `${serverUrl} answered ${setupStatus.response.status}.` };

  const detail = setupStatus.data.isSetUp ? `running at ${serverUrl}` : `running at ${serverUrl}, waiting for setup (work-os status shows the address; the setup code is in work-os logs server)`;
  return { name: "Server", status: "ok", detail };
};
