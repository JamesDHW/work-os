import { CapabilityError } from "@work-os/sdk/CapabilityError";
import { defineCapability } from "@work-os/sdk/defineCapability";
import { z } from "zod";

import { GITHUB_API_URL, GITHUB_CONNECTION_KIND } from "./github.constants.ts";
import { githubHeaders } from "./githubHeaders.ts";
import { requireGithubAccess } from "./requireGithubAccess.ts";

const RepositorySchema = z.object({
  full_name: z.string(),
  description: z.string().nullable(),
  default_branch: z.string(),
  open_issues_count: z.number(),
});

export const readRepositoryCapability = defineCapability({
  id: "github.repository.read",
  connectionKind: GITHUB_CONNECTION_KIND,
  description: "Read a GitHub repository's description, default branch and open issue count. Target: owner/name.",
  effect: "read",
  executionSite: "server",
  editableFields: [],
  argumentsSchema: z.object({}),
  execute: async (context) => {
    const access = requireGithubAccess(context.target, context.secret);
    if (access instanceof CapabilityError) return access;

    const response = await context.http.send({ method: "GET", url: `${GITHUB_API_URL}/repos/${access.repository}`, headers: githubHeaders(access.secret) });
    if (response instanceof CapabilityError) return response;

    const repository = RepositorySchema.safeParse(response.body);
    if (!repository.success) return new CapabilityError(`GitHub answered ${response.status} for ${access.repository}.`);

    const { full_name: fullName, description, default_branch: defaultBranch, open_issues_count: openIssues } = repository.data;
    return `${fullName}: ${description ?? "no description"}. Default branch ${defaultBranch}; ${openIssues} open issues.`;
  },
});
