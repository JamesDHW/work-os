import { execFile } from "child_process";
import { WorkOsError } from "@work-os/shared/WorkOsError";

import { GIT_IDENTITY_ARGUMENTS, GIT_MAX_BUFFER_BYTES } from "./git.constants.ts";

export class GitCommandError extends WorkOsError {}

export const runGit = async (directory: string, gitArguments: readonly string[]): Promise<string | GitCommandError> => {
  const completion = Promise.withResolvers<string | GitCommandError>();
  execFile("git", [...GIT_IDENTITY_ARGUMENTS, ...gitArguments], { cwd: directory, maxBuffer: GIT_MAX_BUFFER_BYTES }, (error, stdout, stderr) => {
    completion.resolve(toGitResult({ error, stdout, stderr, gitArguments }));
  });
  return completion.promise;
};

type GitCompletion = {
  readonly error: Error | null;
  readonly stdout: string;
  readonly stderr: string;
  readonly gitArguments: readonly string[];
};

const toGitResult = (completion: GitCompletion): string | GitCommandError => {
  if (completion.error === null) return completion.stdout.trim();

  const command = `git ${completion.gitArguments.join(" ")}`;
  return new GitCommandError(`${command} failed: ${completion.stderr.trim()}`, { cause: completion.error });
};
