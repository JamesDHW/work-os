import { WorkOsError } from "@work-os/shared/WorkOsError";

import type { CliContext } from "../../CliContext.ts";
import type { Driver } from "../../parseCommandLine.ts";
import { readEnvironmentFile } from "../../profile/environmentFile.ts";
import { ensureGatewayImage } from "../../setup/ensureGatewayImage.ts";
import { writeLine } from "../../writeLine.ts";

// Docker with the egress gateway when it is available, exactly as in a real installation; otherwise commands run
// directly on this machine, which is only acceptable for folders you would trust a script with.
export const chooseDevDriver = async (context: CliContext): Promise<Driver | WorkOsError> => {
  const runnerSettings = await readEnvironmentFile(context.paths.runnerEnvironmentFile);
  if (runnerSettings instanceof WorkOsError) return runnerSettings;

  const requested = context.commandLine.driver ?? asDriver(runnerSettings["WORK_OS_RUNNER_DRIVER"]);
  if (requested === "unsafeHost") return warnUnsafeHost();

  const image = await ensureGatewayImage(context.appDirectory);
  if (image instanceof WorkOsError) return image;
  if (image !== "noDocker") return "docker";
  if (requested === "docker") return new WorkOsError("--driver docker needs Docker running on this machine.");
  return warnUnsafeHost();
};

const asDriver = (value: string | undefined): Driver | undefined => {
  const isDriver = value === "docker" || value === "unsafeHost";
  return isDriver ? value : undefined;
};

const warnUnsafeHost = (): Driver => {
  writeLine("Runner driver: unsafeHost. Runs execute directly on this machine with no container. Use only project folders you trust a script with.");
  return "unsafeHost";
};
