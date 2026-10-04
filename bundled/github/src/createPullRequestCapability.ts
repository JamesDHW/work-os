import { CapabilityError } from "@work-os/sdk/CapabilityError";
import { defineCapability } from "@work-os/sdk/defineCapability";
import { z } from "zod";

import { GITHUB_API_URL, GITHUB_CONNECTION_KIND } from "./github.constants.ts";
import { githubHeaders } from "./githubHeaders.ts";
import { requireGithubAccess } from "./requireGithubAccess.ts";

const PullRequestSchema = z.object({ html_url: z.url(), number: z.number() });

export const createPullRequestCapability = defineCapability({
  id: "github.pr.create",
  connectionKind: GITHUB_CONNECTION_KIND,
  description: "Open a pull request. Target: owner/name. Push the branch with git.push first.",
  effect: "reversible",
  executionSite: "server",
  editableFields: ["title", "body"],
  argumentsSchema: z.object({
    title: z.string().min(1).max(256),
    body: z.string().default(""),
    head: z.string().min(1),
    base: z.string().min(1),
  }),
  execute: async (context) => {
    const access = requireGithubAccess(context.target, context.secret);
    if (access instanceof CapabilityError) return access;

    const response = await context.http.send({
      method: "POST",
      url: `${GITHUB_API_URL}/repos/${access.repository}/pulls`,
      headers: githubHeaders(access.secret),
      body: context.arguments,
    });
    if (response instanceof CapabilityError) return response;

    const pullRequest = PullRequestSchema.safeParse(response.body);
    if (!pullRequest.success) return new CapabilityError(`GitHub answered ${response.status}: ${JSON.stringify(response.body)}`);

    return `Opened pull request #${pullRequest.data.number}: ${pullRequest.data.html_url}`;
  },
});
