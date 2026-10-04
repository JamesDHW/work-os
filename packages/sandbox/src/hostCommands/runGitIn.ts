import type { HostCredential } from "@work-os/domain/runners/RunnerRequest";
import type { CommandOutcome } from "@work-os/domain/runners/RunnerResult";
import type { WorkOsError } from "@work-os/shared/WorkOsError";

import { runProcess } from "../process/runProcess.ts";
import { GIT_COMMAND_TIMEOUT_SECONDS } from "../sandbox.constants.ts";

export const runGitIn = async (projectPath: string, gitArguments: readonly string[], credential?: HostCredential): Promise<CommandOutcome | WorkOsError> => {
  return runProcess({
    command: "git",
    arguments: gitArguments,
    cwd: projectPath,
    environment: { GIT_TERMINAL_PROMPT: "0", ...credentialEnvironment(credential) },
    timeoutSeconds: GIT_COMMAND_TIMEOUT_SECONDS,
  });
};

const credentialEnvironment = (credential: HostCredential | undefined): Readonly<Record<string, string>> => {
  if (credential === undefined) return {};

  const basic = Buffer.from(`${credential.username}:${credential.secret}`).toString("base64");
  return { GIT_CONFIG_COUNT: "1", GIT_CONFIG_KEY_0: "http.extraHeader", GIT_CONFIG_VALUE_0: `Authorization: Basic ${basic}` };
};
