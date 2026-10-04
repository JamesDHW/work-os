import { CapabilityError } from "@work-os/sdk/CapabilityError";
import { defineCapability } from "@work-os/sdk/defineCapability";
import { z } from "zod";

import { GIT_TOKEN_USERNAME, GITHUB_CONNECTION_KIND, PROTECTED_BRANCHES } from "./github.constants.ts";

export const pushBranchCapability = defineCapability({
  id: "git.push",
  connectionKind: GITHUB_CONNECTION_KIND,
  description: "Push the current commit of the project folder to a branch on a remote. Target: the branch name. main and master are refused.",
  effect: "reversible",
  executionSite: "runnerHost",
  editableFields: [],
  argumentsSchema: z.object({ remote: z.string().regex(/^[A-Za-z0-9_.-]+$/u).default("origin") }),
  execute: async (context) => {
    if (PROTECTED_BRANCHES.includes(context.target)) return new CapabilityError(`Pushing to ${context.target} is not allowed; push a branch and open a pull request.`);
    if (context.secret === null) return new CapabilityError("Add a GitHub connection in Settings before pushing.");

    const outcome = await context.runGit({
      arguments: ["push", context.arguments.remote, `HEAD:refs/heads/${context.target}`],
      credential: { username: GIT_TOKEN_USERNAME, secret: context.secret },
    });
    if (outcome instanceof CapabilityError) return outcome;
    if (outcome.exitCode !== 0) return new CapabilityError(`git push failed (exit ${outcome.exitCode}):\n${outcome.output}`);

    return `Pushed to ${context.arguments.remote}/${context.target}.\n${outcome.output}`;
  },
});
