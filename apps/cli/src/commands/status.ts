import { WorkOsError } from "@work-os/shared/WorkOsError";

import type { CliContext } from "../CliContext.ts";
import { DOCTOR_MARKS, SERVICE_NAMES } from "../cli.constants.ts";
import { checkRunnerPairing } from "../doctor/checkRunnerPairing.ts";
import { readProfileSettings, type ProfileSettings } from "../profile/readProfileSettings.ts";
import { readSetupStatus, type SetupStatus } from "../server/waitForServer.ts";
import type { ServiceStatus } from "../services/ServiceManager.ts";
import { writeLine } from "../writeLine.ts";

// What this profile looks like from the outside: its services, whether the server answers, and whether this machine is paired.
export const runStatus = async (context: CliContext): Promise<WorkOsError | undefined> => {
  const { paths } = context;
  const settings = await readProfileSettings(paths);
  if (settings instanceof WorkOsError) return settings;

  writeLine(`Profile ${paths.profile} (${paths.root})`);
  for (const name of SERVICE_NAMES) {
    const status = await context.services.status({ profile: paths.profile, name });
    if (status instanceof WorkOsError) return status;
    writeLine(`${mark(status)} ${name}: ${describe(status)}  log: ${name === "server" ? paths.serverLogFile : paths.runnerLogFile}`);
  }

  const setupStatus = await readSetupStatus(settings.localUrl);
  writeLine(describeServer(settings, setupStatus));

  const pairing = await checkRunnerPairing(paths.runnerDataDirectory);
  writeLine(`${DOCTOR_MARKS[pairing.status]} pairing: ${pairing.detail}`);
  return undefined;
};

const describeServer = (settings: ProfileSettings, setupStatus: SetupStatus | WorkOsError): string => {
  if (setupStatus instanceof WorkOsError) return `${DOCTOR_MARKS.warn} server: not answering at ${settings.localUrl}`;

  const setupNote = setupStatus.isSetUp ? "" : " (waiting for setup)";
  return `${DOCTOR_MARKS.ok} server: answering at ${settings.localUrl}, open it at ${settings.publicOrigin}${setupNote}`;
};

const mark = (status: ServiceStatus): string => (status.state === "running" ? DOCTOR_MARKS.ok : DOCTOR_MARKS.warn);

const describe = (status: ServiceStatus): string => {
  switch (status.state) {
    case "running":
      return `running (pid ${status.processId})`;
    case "stopped":
      return "installed, not running";
    case "notInstalled":
      return "not installed";
    default:
      return status.state satisfies never;
  }
};
