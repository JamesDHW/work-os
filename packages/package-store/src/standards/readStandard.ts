import { toAgentId, toStandardId } from "@work-os/domain/identifiers/Identifiers";
import type { Standard } from "@work-os/domain/standards/Standard";
import { StandardFrontmatterSchema } from "@work-os/protocol/package/standardFrontmatter.schema";
import { InvalidRequestError } from "@work-os/shared/InvalidRequestError";
import { WorkOsError } from "@work-os/shared/WorkOsError";
import { join } from "path";

import { METHOD_FILE, STANDARD_FILE } from "../files/files.constants.ts";
import { parseFrontmatter } from "../files/parseFrontmatter.ts";
import { parseWithSchema } from "@work-os/protocol/common/parseWithSchema";
import { readTextFile } from "../files/readTextFile.ts";

export const readStandard = async (standardDirectory: string, folderName: string): Promise<Standard | WorkOsError> => {
  const text = await readTextFile(join(standardDirectory, STANDARD_FILE));
  if (text instanceof WorkOsError) return text;

  const standard = parseStandardText(text, folderName);
  if (standard instanceof WorkOsError) return standard;

  const method = await readTextFile(join(standardDirectory, METHOD_FILE));
  return { ...standard, method: method instanceof WorkOsError ? "" : method.trim() };
};

export const parseStandardText = (text: string, folderName: string): Standard | WorkOsError => {
  const fileName = `standards/${folderName}/${STANDARD_FILE}`;
  const document = parseFrontmatter(text, fileName);
  if (document instanceof WorkOsError) return document;

  const frontmatter = parseWithSchema(StandardFrontmatterSchema, document.attributes, fileName);
  if (frontmatter instanceof WorkOsError) return frontmatter;
  if (frontmatter.id !== folderName) return new InvalidRequestError(`${fileName} declares id "${frontmatter.id}" but lives in "${folderName}".`);

  const { agent, input, ...configuration } = frontmatter;
  const inputHint = input === undefined ? {} : { inputHint: input };
  return {
    ...configuration,
    ...inputHint,
    id: toStandardId(frontmatter.id),
    agentId: toAgentId(agent),
    criteria: document.body,
    method: "",
  };
};
