import { DOCTOR_MARKS } from "../cli.constants.ts";
import { writeLine } from "../writeLine.ts";
import { checkDocker, checkEgressImage } from "./checkDocker.ts";
import { checkNodeVersion } from "./checkNodeVersion.ts";
import { checkRunnerPairing } from "./checkRunnerPairing.ts";
import { checkServer } from "./checkServer.ts";
import type { DoctorCheck } from "./DoctorCheck.ts";

export type DoctorInput = {
  readonly nodeVersion: string;
  readonly serverUrl: string;
  readonly runnerDataDirectory: string;
};

export const formatDoctorCheck = (check: DoctorCheck): string => `${DOCTOR_MARKS[check.status]} ${check.name}: ${check.detail}`;

// Prints one line per check and reports whether every check passed or only warned.
export const runDoctor = async (input: DoctorInput): Promise<boolean> => {
  const checks = [
    checkNodeVersion(input.nodeVersion),
    await checkDocker(),
    await checkEgressImage(),
    await checkRunnerPairing(input.runnerDataDirectory),
    await checkServer(input.serverUrl),
  ];
  for (const check of checks) {
    writeLine(formatDoctorCheck(check));
  }
  return checks.every((check) => check.status !== "fail");
};
