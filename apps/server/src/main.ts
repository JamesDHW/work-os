import { parseServerConfig } from "@work-os/config/ServerConfig";
import { WorkOsError } from "@work-os/shared/WorkOsError";
import process from "process";

import { createConsoleLogger } from "./createConsoleLogger.ts";
import { startServer } from "./startServer.ts";

const logger = createConsoleLogger((line) => process.stdout.write(`${line}\n`));
const config = parseServerConfig({
  environment: process.env,
  homeDirectory: process.env["HOME"] ?? ".",
  bundledPackagesDirectory: new URL("../../../bundled", import.meta.url).pathname,
});

const run = async (): Promise<undefined> => {
  if (config instanceof WorkOsError) {
    logger.error(config.message);
    process.exitCode = 1;
    return undefined;
  }
  const server = await startServer(config, logger);
  if (server instanceof WorkOsError) {
    logger.error("work-os server could not start.", { message: server.message, cause: String(server.cause) });
    process.exitCode = 1;
    return undefined;
  }
  process.once("SIGINT", () => void server.close());
  process.once("SIGTERM", () => void server.close());
  return undefined;
};

void run();
