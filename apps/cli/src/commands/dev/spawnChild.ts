import { tryCatch } from "@work-os/shared/tryCatch";
import { WorkOsError } from "@work-os/shared/WorkOsError";
import { spawn, type ChildProcess } from "child_process";
import process from "process";
import { createInterface } from "readline/promises";

import { CommandStartError } from "../../runCommand.ts";

export type ChildCommand = {
  readonly label: string;
  readonly command: string;
  readonly arguments: readonly string[];
  readonly cwd: string;
  readonly environment: Readonly<Record<string, string | undefined>>;
};

export type SpawnedChild = {
  readonly child: ChildProcess;
  readonly exited: Promise<number>;
};

// One process of the dev loop, with every line of its output prefixed so three processes can share one terminal.
export const spawnChild = (childCommand: ChildCommand): SpawnedChild | WorkOsError => {
  const child = tryCatch(() =>
    spawn(childCommand.command, [...childCommand.arguments], { cwd: childCommand.cwd, env: { ...process.env, ...childCommand.environment }, stdio: ["ignore", "pipe", "pipe"] }),
  );
  if (child instanceof WorkOsError) return new CommandStartError(`Could not start ${childCommand.label}.`, { cause: child });

  const prefix = `[${childCommand.label}]`.padEnd(9);
  for (const stream of [child.stdout, child.stderr]) {
    createInterface({ input: stream }).on("line", (line) => process.stdout.write(`${prefix} ${line}\n`));
  }

  const exited = Promise.withResolvers<number>();
  child.on("error", (error) => {
    process.stdout.write(`${prefix} failed: ${error.message}\n`);
    exited.resolve(-1);
  });
  child.on("close", (exitCode) => exited.resolve(exitCode ?? -1));
  return { child, exited: exited.promise };
};
