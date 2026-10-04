import { CapabilityError } from "@work-os/sdk/CapabilityError";
import { defineCapability } from "@work-os/sdk/defineCapability";
import { z } from "zod";

export const readStandardCapability = defineCapability({
  id: "workos.standard.read",
  connectionKind: "",
  description: "Read a standard's STANDARD.md and METHOD.md from the workspace package. Target: the standard id.",
  effect: "read",
  executionSite: "server",
  editableFields: [],
  argumentsSchema: z.object({}),
  execute: async (context) => {
    const standard = await context.workspaceFiles.readFile(`standards/${context.target}/STANDARD.md`);
    if (standard instanceof CapabilityError) return standard;

    const method = await context.workspaceFiles.readFile(`standards/${context.target}/METHOD.md`);
    const methodText = method instanceof CapabilityError ? "(no METHOD.md)" : method;
    return `# STANDARD.md\n\n${standard}\n\n# METHOD.md\n\n${methodText}`;
  },
});
