import { WorkOsError } from "@work-os/shared/WorkOsError";
import { join } from "path";

import type { CliContext } from "../../CliContext.ts";
import { CHILD_LABELS } from "./dev.constants.ts";
import type { DevEnvironment } from "./devEnvironment.ts";
import type { DevProcesses } from "./devProcesses.state.ts";
import { spawnChild, type SpawnedChild } from "./spawnChild.ts";

export type DevChildrenInput = {
  readonly context: CliContext;
  readonly environment: DevEnvironment;
  readonly processes: DevProcesses;
};

export type DevChildren = {
  /** Resolves with the exit code of the first long-running process to stop; null for a signal. */
  readonly anyExited: Promise<number | null>;
};

export const startDevChildren = (input: DevChildrenInput): DevChildren | WorkOsError => {
  const { context, environment } = input;
  const server = spawnChild({
    label: CHILD_LABELS.server,
    command: context.nodePath,
    arguments: ["--watch", join("apps", "server", "src", "main.ts")],
    cwd: context.appDirectory,
    environment: environment.server,
  });
  if (server instanceof WorkOsError) return server;
  input.processes.register(server.child);

  const web = spawnChild({
    label: CHILD_LABELS.web,
    command: "pnpm",
    arguments: ["--filter", "@work-os/web", "exec", "vite", "--port", String(environment.webPort), "--strictPort"],
    cwd: context.appDirectory,
    environment: { WORK_OS_DEV_SERVER_URL: environment.serverUrl },
  });
  if (web instanceof WorkOsError) return web;
  input.processes.register(web.child);

  return { anyExited: Promise.race([server.exited, web.exited]) };
};

export const startDevRunner = (input: DevChildrenInput): SpawnedChild | WorkOsError => {
  const runner = spawnChild({
    label: CHILD_LABELS.runner,
    command: input.context.nodePath,
    arguments: [join("apps", "runner", "src", "main.ts")],
    cwd: input.context.appDirectory,
    environment: input.environment.runner,
  });
  if (runner instanceof WorkOsError) return runner;
  input.processes.register(runner.child);
  return runner;
};
