import { WorkOsError } from "@work-os/shared/WorkOsError";

import { EGRESS_GATEWAY_IMAGE } from "../cli.constants.ts";
import { runCommand } from "../runCommand.ts";
import { runInTerminal } from "../runInTerminal.ts";
import { writeLine } from "../writeLine.ts";

export type GatewayImageOutcome = "present" | "built" | "noDocker";

// Runs leave their containers only through the egress gateway, an image built from this checkout rather than pulled.
export const ensureGatewayImage = async (appDirectory: string): Promise<GatewayImageOutcome | WorkOsError> => {
  const docker = await runCommand("docker", ["version", "--format", "{{.Server.Version}}"]);
  const hasDocker = !(docker instanceof WorkOsError) && docker.exitCode === 0;
  if (!hasDocker) return "noDocker";

  const image = await runCommand("docker", ["image", "inspect", "--format", "{{.Id}}", EGRESS_GATEWAY_IMAGE]);
  const isPresent = !(image instanceof WorkOsError) && image.exitCode === 0;
  if (isPresent) return "present";

  writeLine(`Building the egress gateway image ${EGRESS_GATEWAY_IMAGE}…`);
  const exitCode = await runInTerminal({ command: "pnpm", arguments: ["egress:image"], cwd: appDirectory });
  if (exitCode instanceof WorkOsError) return exitCode;
  if (exitCode !== 0) return new WorkOsError(`Building the egress gateway image failed (exit ${exitCode}).`);
  return "built";
};
