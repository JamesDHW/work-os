import type { RunnerPlatform } from "@work-os/domain/runners/Runner";

export const toRunnerPlatform = (nodePlatform: string): RunnerPlatform => {
  switch (nodePlatform) {
    case "darwin":
      return "darwin";
    case "win32":
      return "windows";
    default:
      return "linux";
  }
};
