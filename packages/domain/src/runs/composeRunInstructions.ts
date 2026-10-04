import type { RunSpec } from "./RunSpec.ts";
import { RUN_PROTOCOL_INSTRUCTIONS } from "./composeRunInstructions.constants.ts";

export const composeRunInstructions = (spec: RunSpec): string => {
  const sections = [
    spec.agent.instructions,
    RUN_PROTOCOL_INSTRUCTIONS,
    tagSection("standard", spec.standard.criteria),
    tagSection("method", spec.standard.method),
    tagSection("capabilities", describeCapabilities(spec)),
    tagSection("skills", describeSkills(spec)),
  ];
  return sections.filter((section) => section.length > 0).join("\n\n");
};

const tagSection = (tag: string, content: string): string => {
  const trimmedContent = content.trim();
  if (trimmedContent.length === 0) return "";

  return `<${tag}>\n${trimmedContent}\n</${tag}>`;
};

const describeCapabilities = (spec: RunSpec): string => {
  if (spec.capabilities.length === 0) return "No capabilities are declared for this run.";

  return `Declared capabilities: ${spec.capabilities.join(", ")}.`;
};

const describeSkills = (spec: RunSpec): string => {
  if (spec.skills.length === 0) return "";

  return `Skills you can load with load_skill: ${spec.skills.join(", ")}.`;
};
