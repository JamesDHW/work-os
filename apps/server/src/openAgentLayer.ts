import type { ServerConfig } from "@work-os/config/ServerConfig";
import type { RunToolHandlers } from "@work-os/core/runs/RunToolHandlers";
import type { Logger } from "@work-os/core/system/Logger";
import { openAgentHarness, type AgentHarness } from "@work-os/harness/openAgentHarness";
import type { WorkOsError } from "@work-os/shared/WorkOsError";

import type { ServerContext } from "./ServerContext.ts";

export const openAgentLayer = async (config: ServerConfig, context: ServerContext, handlers: RunToolHandlers, logger: Logger): Promise<AgentHarness | WorkOsError> =>
  openAgentHarness({ storage: { kind: "file", path: `${config.dataDirectory}/durable.sqlite` }, models: context.modelCatalogue.models, handlers, logger });
