import { WorkOsError } from "@work-os/shared/WorkOsError";

import { EGRESS_GATEWAY_IMAGE } from "../cli.constants.ts";
import { runCommand } from "../runCommand.ts";
import type { DoctorCheck } from "./DoctorCheck.ts";

export const checkDocker = async (): Promise<DoctorCheck> => {
  const version = await runCommand("docker", ["version", "--format", "{{.Server.Version}}"]);
  if (version instanceof WorkOsError) return { name: "Docker", status: "warn", detail: "not installed. Runs need Docker (or WORK_OS_RUNNER_DRIVER=unsafeHost for trusted work)." };
  if (version.exitCode !== 0) return { name: "Docker", status: "warn", detail: "installed but not running. Start Docker Desktop." };

  return { name: "Docker", status: "ok", detail: `engine ${version.output}` };
};

export const checkEgressImage = async (): Promise<DoctorCheck> => {
  const image = await runCommand("docker", ["image", "inspect", "--format", "{{.Id}}", EGRESS_GATEWAY_IMAGE]);
  const isPresent = !(image instanceof WorkOsError) && image.exitCode === 0;
  if (!isPresent) return { name: "Egress gateway image", status: "warn", detail: `${EGRESS_GATEWAY_IMAGE} is missing. Build it with: pnpm egress:image` };

  return { name: "Egress gateway image", status: "ok", detail: EGRESS_GATEWAY_IMAGE };
};
