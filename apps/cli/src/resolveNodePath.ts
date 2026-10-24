import { WorkOsError } from "@work-os/shared/WorkOsError";
import process from "process";

import { runCommand } from "./runCommand.ts";

// From source this CLI is Node, so the services use the same binary. Compiled with Bun, the CLI is its own
// executable and the services still need a Node 24 on the PATH.
export const resolveNodePath = async (): Promise<string | WorkOsError> => {
  const isCompiled = process.versions["bun"] !== undefined;
  if (!isCompiled) return process.execPath;

  const found = await runCommand("node", ["-p", "process.execPath"]);
  if (found instanceof WorkOsError) return new WorkOsError("Node.js 24 or later must be installed and on the PATH to run the work-os services.");
  if (found.exitCode !== 0) return new WorkOsError(`Could not run node: ${found.output}`);
  return found.output.trim();
};
