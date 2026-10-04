export const githubHeaders = (secret: string): Readonly<Record<string, string>> => ({
  accept: "application/vnd.github+json",
  authorization: `Bearer ${secret}`,
  "x-github-api-version": "2022-11-28",
  "user-agent": "work-os",
});
