import type { paths } from "@work-os/api-types/apiSchema";
import { tryCatchAsync } from "@work-os/shared/tryCatch";
import { WorkOsError } from "@work-os/shared/WorkOsError";
import createClient from "openapi-fetch";

import type { CliContext } from "../CliContext.ts";
import { readProfileSettings } from "../profile/readProfileSettings.ts";
import { readSetupStatus } from "../server/waitForServer.ts";
import { runRunnerPair } from "./runRunnerPair.ts";
import { issueSignInCode } from "./signInCode.ts";

// On the server's own machine no one should have to copy a pairing code around: a one-time sign-in code proves
// command access here, which is enough to ask the server for a pairing code and hand it to this machine's runner.
export const pairLocalRunner = async (context: CliContext): Promise<WorkOsError | undefined> => {
  const settings = await readProfileSettings(context.paths);
  if (settings instanceof WorkOsError) return settings;

  const status = await readSetupStatus(settings.localUrl);
  if (status instanceof WorkOsError) return new WorkOsError(`The server is not answering at ${settings.localUrl}. Start it first: work-os start server`);
  if (!status.isSetUp) return new WorkOsError(`Create your account at ${settings.publicOrigin} first, then run this again.`);

  const code = await issueSignInCode(context.paths);
  if (code instanceof WorkOsError) return code;

  const client = createClient<paths>({ baseUrl: settings.localUrl });
  const signedIn = await tryCatchAsync(async () => client.POST("/api/sign-in-code", { body: { code } }));
  if (signedIn instanceof WorkOsError) return signedIn;

  const cookie = signedIn.response.headers.get("set-cookie")?.split(";")[0];
  if (cookie === undefined) return new WorkOsError(`The server refused the sign-in code (${signedIn.response.status}).`);

  const authenticated = createClient<paths>({ baseUrl: settings.localUrl, headers: { cookie } });
  const session = await tryCatchAsync(async () => authenticated.GET("/api/session"));
  if (session instanceof WorkOsError) return session;

  const workspaceId = session.data?.workspaces[0]?.id;
  if (workspaceId === undefined) return new WorkOsError("The account has no workspace.");

  const pairingCode = await tryCatchAsync(async () => authenticated.POST("/api/w/{workspaceId}/runners/pairing-codes", { params: { path: { workspaceId } } }));
  if (pairingCode instanceof WorkOsError) return pairingCode;
  if (pairingCode.data === undefined) return new WorkOsError(`Could not create a pairing code (${pairingCode.response.status}).`);

  return runRunnerPair(context, settings.localUrl, pairingCode.data.code);
};
