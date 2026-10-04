import { WorkOsError } from "@work-os/shared/WorkOsError";

import { SAFE_RELATIVE_PATH_PATTERN, STANDARD_FILE } from "../files/files.constants.ts";
import { parseStandardText } from "../standards/readStandard.ts";

export const validatePackageFile = (path: string, content: string): readonly string[] => {
  if (!SAFE_RELATIVE_PATH_PATTERN.test(path)) return [`"${path}" is not a workspace package path.`];

  const [folder, entryName] = path.split("/");
  const isStandardFile = folder === "standards" && path.endsWith(`/${STANDARD_FILE}`) && entryName !== undefined;
  if (!isStandardFile) return [];

  const standard = parseStandardText(content, entryName);
  return standard instanceof WorkOsError ? [standard.message] : [];
};
