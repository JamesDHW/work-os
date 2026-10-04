import { serve } from "@hono/node-server";
import type { ServerConfig } from "@work-os/config/ServerConfig";
import type { Logger } from "@work-os/core/system/Logger";
import { WorkOsError } from "@work-os/shared/WorkOsError";

import { composeApiServices } from "./composeApiServices.ts";
import { composeRunOperations } from "./composeRunOperations.ts";
import { composeRunToolHandlers } from "./composeRunToolHandlers.ts";
import { composeSharedOperations } from "./composeSharedOperations.ts";
import { createRootApp, type RootApp } from "./createRootApp.ts";
import { openAgentLayer } from "./openAgentLayer.ts";
import { openServerContext } from "./openServerContext.ts";
import { announceSetupCode } from "./announceSetupCode.ts";
import { RELYING_PARTY_NAME, SERVER_VERSION } from "./server.constants.ts";

export type RunningServer = {
  readonly close: () => Promise<undefined>;
};

export type ComposedServer = RootApp & {
  readonly resumeActiveRuns: () => Promise<WorkOsError | undefined>;
  readonly close: () => Promise<undefined>;
};

export const startServer = async (config: ServerConfig, logger: Logger): Promise<RunningServer | WorkOsError> => {
  const composed = await composeServer(config, logger);
  if (composed instanceof WorkOsError) return composed;

  const server = serve({ fetch: composed.app.fetch, port: config.port, hostname: config.host });
  composed.injectWebSocket(server);
  logger.info("work-os server listening.", { url: `http://${config.host}:${config.port}`, publicOrigin: config.publicOrigin });
  await composed.resumeActiveRuns();

  const close = async (): Promise<undefined> => {
    server.close();
    return composed.close();
  };
  return { close };
};

export const composeServer = async (config: ServerConfig, logger: Logger): Promise<ComposedServer | WorkOsError> => {
  const opened = await openServerContext(config, logger);
  if (opened instanceof WorkOsError) return opened;

  const { context } = opened;
  const shared = composeSharedOperations(context);
  const agent = await openAgentLayer(config, composeRunToolHandlers(context, shared), logger);
  if (agent instanceof WorkOsError) return agent;

  const runs = composeRunOperations(context, shared, agent.agentRuntime);
  const setupCode = await announceSetupCode({ config, context });
  const origin = new URL(config.publicOrigin);
  const settings = {
    publicOrigin: origin.origin,
    relyingPartyId: origin.hostname,
    relyingPartyName: RELYING_PARTY_NAME,
    isSecureCookie: origin.protocol === "https:",
    serverVersion: SERVER_VERSION,
  };
  const services = composeApiServices({ context, shared, runs, settings, readSetupCode: () => setupCode });
  const close = async (): Promise<undefined> => {
    await agent.close();
    opened.close();
    return undefined;
  };
  return { ...createRootApp(services, config.webDistDirectory), resumeActiveRuns: runs.resumeActiveRuns, close };
};
