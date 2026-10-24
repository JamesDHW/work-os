import { DEFAULT_PROFILE, DEV_PROFILE, WORK_OS_FOLDER } from "@work-os/config/config.constants";
import { profilePaths } from "@work-os/config/ProfilePaths";
import { tryCatchAsync } from "@work-os/shared/tryCatch";
import { WorkOsError } from "@work-os/shared/WorkOsError";
import { mkdir, rename, rm, stat } from "fs/promises";
import { dirname, join } from "path";

import { LEGACY_LAUNCH_AGENT_LABELS, LEGACY_SYSTEMD_UNITS, PROFILE_FOLDER_MODE } from "../cli.constants.ts";
import { runCommand } from "../runCommand.ts";
import { writeLine } from "../writeLine.ts";

export type LegacyLayoutInput = {
  readonly homeDirectory: string;
  readonly platform: string;
  readonly userId: number | undefined;
};

type Move = { readonly from: string; readonly to: string };

// Before profiles, one installation lived directly under ~/.work-os and ran as dev.work-os.* services.
// Moving it into the "default" profile keeps its account, passkeys and pairing.
export const migrateLegacyLayout = async (input: LegacyLayoutInput): Promise<WorkOsError | undefined> => {
  const removed = await removeLegacyServices(input);
  if (removed instanceof WorkOsError) return removed;

  for (const move of legacyMoves(input.homeDirectory)) {
    const moved = await moveIfPresent(move);
    if (moved instanceof WorkOsError) return moved;
  }
  return undefined;
};

const legacyMoves = (homeDirectory: string): readonly Move[] => {
  const legacyRoot = join(homeDirectory, WORK_OS_FOLDER);
  const main = profilePaths(homeDirectory, DEFAULT_PROFILE);
  const development = profilePaths(homeDirectory, DEV_PROFILE);
  return [
    { from: join(legacyRoot, "server"), to: main.serverDataDirectory },
    { from: join(legacyRoot, "runner"), to: main.runnerDataDirectory },
    { from: join(legacyRoot, "server.env"), to: main.serverEnvironmentFile },
    { from: join(legacyRoot, "runner.env"), to: main.runnerEnvironmentFile },
    { from: join(legacyRoot, "server.log"), to: main.serverLogFile },
    { from: join(legacyRoot, "runner.log"), to: main.runnerLogFile },
    { from: join(legacyRoot, "dev-server"), to: development.serverDataDirectory },
    { from: join(legacyRoot, "dev-runner"), to: development.runnerDataDirectory },
  ];
};

const moveIfPresent = async (move: Move): Promise<WorkOsError | undefined> => {
  const source = await tryCatchAsync(() => stat(move.from));
  if (source instanceof WorkOsError) return undefined;

  const destination = await tryCatchAsync(() => stat(move.to));
  if (!(destination instanceof WorkOsError)) return undefined;

  const moved = await tryCatchAsync(async () => {
    await mkdir(dirname(move.to), { recursive: true, mode: PROFILE_FOLDER_MODE });
    await rename(move.from, move.to);
  });
  if (moved instanceof WorkOsError) return moved;

  writeLine(`Moved ${move.from} to ${move.to}.`);
  return undefined;
};

const removeLegacyServices = async (input: LegacyLayoutInput): Promise<WorkOsError | undefined> => {
  switch (input.platform) {
    case "darwin": {
      for (const label of LEGACY_LAUNCH_AGENT_LABELS) {
        await runCommand("launchctl", ["bootout", `gui/${input.userId ?? 0}/${label}`]);
        await removeIfPresent(join(input.homeDirectory, "Library/LaunchAgents", `${label}.plist`), label);
      }
      return undefined;
    }
    case "linux": {
      for (const unit of LEGACY_SYSTEMD_UNITS) {
        await runCommand("systemctl", ["--user", "disable", "--now", unit]);
        await removeIfPresent(join(input.homeDirectory, ".config/systemd/user", unit), unit);
      }
      return undefined;
    }
    default:
      return undefined;
  }
};

const removeIfPresent = async (path: string, label: string): Promise<undefined> => {
  const present = await tryCatchAsync(() => stat(path));
  if (present instanceof WorkOsError) return undefined;

  await tryCatchAsync(() => rm(path, { force: true }));
  writeLine(`Removed the old ${label} service.`);
  return undefined;
};
