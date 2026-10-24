import type { paths } from "@work-os/api-types/apiSchema";
import { tryCatchAsync } from "@work-os/shared/tryCatch";
import { WorkOsError } from "@work-os/shared/WorkOsError";
import createClient from "openapi-fetch";
import { setTimeout } from "timers/promises";

import { SERVER_POLL_INTERVAL_MILLISECONDS, SERVER_READY_TIMEOUT_MILLISECONDS } from "../cli.constants.ts";

export type SetupStatus = paths["/api/setup"]["get"]["responses"]["200"]["content"]["application/json"];

export class ServerNotReadyError extends WorkOsError {}

/** The server's setup status once it answers, or an error when it has not come up within the timeout. */
export const waitForServer = async (serverUrl: string, deadline = Date.now() + SERVER_READY_TIMEOUT_MILLISECONDS): Promise<SetupStatus | WorkOsError> => {
  const status = await readSetupStatus(serverUrl);
  if (!(status instanceof WorkOsError)) return status;
  if (Date.now() >= deadline) return new ServerNotReadyError(`The server at ${serverUrl} did not answer within ${SERVER_READY_TIMEOUT_MILLISECONDS / 1000} seconds.`);

  await setTimeout(SERVER_POLL_INTERVAL_MILLISECONDS);
  return waitForServer(serverUrl, deadline);
};

export const readSetupStatus = async (serverUrl: string): Promise<SetupStatus | WorkOsError> => {
  const client = createClient<paths>({ baseUrl: serverUrl });
  const response = await tryCatchAsync(async () => client.GET("/api/setup"));
  if (response instanceof WorkOsError) return response;
  if (response.data === undefined) return new ServerNotReadyError(`${serverUrl} answered ${response.response.status}.`);
  return response.data;
};
