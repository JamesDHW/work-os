import type { Skill } from "@work-os/domain/skills/Skill";
import { SkillFrontmatterSchema } from "@work-os/protocol/package/skillFrontmatter.schema";
import { WorkOsError } from "@work-os/shared/WorkOsError";
import { join } from "path";

import { SKILL_FILE } from "../files/files.constants.ts";
import { parseFrontmatter } from "../files/parseFrontmatter.ts";
import { parseWithSchema } from "@work-os/protocol/common/parseWithSchema";
import { readTextFile } from "../files/readTextFile.ts";

export const readSkill = async (skillDirectory: string, folderName: string): Promise<Skill | WorkOsError> => {
  const fileName = `skills/${folderName}/${SKILL_FILE}`;
  const text = await readTextFile(join(skillDirectory, SKILL_FILE));
  if (text instanceof WorkOsError) return text;

  const document = parseFrontmatter(text, fileName);
  if (document instanceof WorkOsError) return document;

  const frontmatter = parseWithSchema(SkillFrontmatterSchema, document.attributes, fileName);
  if (frontmatter instanceof WorkOsError) return frontmatter;

  return { ...frontmatter, body: document.body };
};
