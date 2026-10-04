import { defineCapability } from "@work-os/sdk/defineCapability";
import { z } from "zod";

export const saveStandardCapability = defineCapability({
  id: "workos.standard.save",
  connectionKind: "",
  description:
    "Save a standard to the workspace package as a Git commit. Target: the standard id. The user approves, and may edit, the exact text.",
  effect: "reversible",
  executionSite: "server",
  editableFields: ["standardMarkdown", "methodMarkdown"],
  argumentsSchema: z.object({
    standardMarkdown: z.string().min(1),
    methodMarkdown: z.string().default(""),
    summary: z.string().min(1).default("Update a standard"),
  }),
  execute: async (context) => {
    const files = {
      [`standards/${context.target}/STANDARD.md`]: context.arguments.standardMarkdown,
      [`standards/${context.target}/METHOD.md`]: context.arguments.methodMarkdown,
    };
    const revision = await context.workspaceFiles.writeFiles(files, `${context.arguments.summary} (${context.target})`);
    if (typeof revision !== "string") return revision;

    return `Saved standard ${context.target} as revision ${revision}.`;
  },
});
