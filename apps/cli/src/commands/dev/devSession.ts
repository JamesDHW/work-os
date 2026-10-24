import type { paths } from "@work-os/api-types/apiSchema";
import { tryCatchAsync } from "@work-os/shared/tryCatch";
import { WorkOsError } from "@work-os/shared/WorkOsError";
import createClient from "openapi-fetch";

import { DEV_DISPLAY_NAME } from "./dev.constants.ts";

export type DevSession = {
  readonly serverUrl: string;
  /** The session cookie the development server issued; sent back on every call the dev loop makes for you. */
  readonly cookie: string;
};

export type DevSessionInput = {
  readonly serverUrl: string;
  readonly isSetUp: boolean;
  readonly setupCode: string;
};

// A development server signs its one account in on request, and `work-os dev` creates that account the first time.
export const openDevSession = async (input: DevSessionInput): Promise<DevSession | WorkOsError> => {
  const client = createClient<paths>({ baseUrl: input.serverUrl });
  const response = await tryCatchAsync(async () =>
    input.isSetUp ? client.POST("/api/dev-sign-in") : client.POST("/api/setup", { body: { setupCode: input.setupCode, displayName: DEV_DISPLAY_NAME } }),
  );
  if (response instanceof WorkOsError) return response;
  if (!response.response.ok) return new WorkOsError(`The development server refused to sign in (${response.response.status}).`);

  const cookie = response.response.headers.get("set-cookie")?.split(";")[0];
  if (cookie === undefined) return new WorkOsError("The development server did not issue a session cookie.");
  return { serverUrl: input.serverUrl, cookie };
};

export type DevClient = ReturnType<typeof createClient<paths>>;

export const devClient = (session: DevSession): DevClient => createClient<paths>({ baseUrl: session.serverUrl, headers: { cookie: session.cookie } });
