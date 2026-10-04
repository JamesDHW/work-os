import type { AgentPreset } from "@work-os/domain/agents/AgentPreset";
import { toAgentId } from "@work-os/domain/identifiers/Identifiers";
import { AgentFrontmatterSchema } from "@work-os/protocol/package/agentFrontmatter.schema";
import { InvalidRequestError } from "@work-os/shared/InvalidRequestError";
import { WorkOsError } from "@work-os/shared/WorkOsError";
import { join } from "path";

import { AGENT_FILE } from "../files/files.constants.ts";
import { parseFrontmatter } from "../files/parseFrontmatter.ts";
import { parseWithSchema } from "@work-os/protocol/common/parseWithSchema";
import { readTextFile } from "../files/readTextFile.ts";

export const readAgent = async (agentDirectory: string, folderName: string): Promise<AgentPreset | WorkOsError> => {
  const fileName = `agents/${folderName}/${AGENT_FILE}`;
  const text = await readTextFile(join(agentDirectory, AGENT_FILE));
  if (text instanceof WorkOsError) return text;

  const document = parseFrontmatter(text, fileName);
  if (document instanceof WorkOsError) return document;

  const frontmatter = parseWithSchema(AgentFrontmatterSchema, document.attributes, fileName);
  if (frontmatter instanceof WorkOsError) return frontmatter;
  if (frontmatter.id !== folderName) return new InvalidRequestError(`${fileName} declares id "${frontmatter.id}" but lives in "${folderName}".`);

  return {
    id: toAgentId(frontmatter.id),
    name: frontmatter.name,
    model: frontmatter.model,
    thinkingLevel: frontmatter.thinking,
    skills: frontmatter.skills,
    instructions: document.body,
  };
};
