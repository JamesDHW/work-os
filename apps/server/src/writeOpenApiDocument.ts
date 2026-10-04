import { parseServerConfig } from "@work-os/config/ServerConfig";
import { tryCatchAsync } from "@work-os/shared/tryCatch";
import { WorkOsError } from "@work-os/shared/WorkOsError";
import { writeFile } from "fs/promises";
import process from "process";

import { createConsoleLogger } from "./createConsoleLogger.ts";
import { composeServer } from "./startServer.ts";

const logger = createConsoleLogger((line) => process.stderr.write(`${line}\n`));
const outputPath = process.argv[2];

const run = async (): Promise<WorkOsError | undefined> => {
  if (outputPath === undefined) return new WorkOsError("Usage: writeOpenApiDocument.ts <output.json>");

  const bundledPackagesDirectory = new URL("../../../bundled", import.meta.url).pathname;
  const config = parseServerConfig({ environment: process.env, homeDirectory: process.env["HOME"] ?? ".", bundledPackagesDirectory });
  if (config instanceof WorkOsError) return config;

  const composed = await composeServer(config, logger);
  if (composed instanceof WorkOsError) return composed;

  const response = await composed.app.request("/api/openapi.json");
  const written = await tryCatchAsync(async () => writeFile(outputPath, `${JSON.stringify(await response.json(), null, 2)}\n`));
  await composed.close();
  return written instanceof WorkOsError ? written : undefined;
};

const failure = await run();
if (failure instanceof WorkOsError) {
  logger.error(failure.message);
  process.exitCode = 1;
}
