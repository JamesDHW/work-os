import { InvalidRequestError } from "@work-os/shared/InvalidRequestError";
import { tryCatch } from "@work-os/shared/tryCatch";
import { WorkOsError } from "@work-os/shared/WorkOsError";
import { parse } from "yaml";

import { FRONTMATTER_PATTERN } from "./files.constants.ts";

export type FrontmatterDocument = {
  readonly attributes: unknown;
  readonly body: string;
};

export const parseFrontmatter = (text: string, fileName: string): FrontmatterDocument | WorkOsError => {
  const match = FRONTMATTER_PATTERN.exec(text);
  if (match === null) return new InvalidRequestError(`${fileName} must start with a --- frontmatter block.`);

  const [, frontmatter = "", body = ""] = match;
  const attributes = tryCatch((): unknown => parse(frontmatter));
  if (attributes instanceof WorkOsError) return new InvalidRequestError(`${fileName} has invalid YAML frontmatter: ${attributes.message}`);

  return { attributes, body: body.trim() };
};
