import { TOOL_PREVIEW_LENGTH } from "../runs.constants.ts";

// One line of a tool call's arguments or a tool's output, for the collapsed transcript entry.
export const toToolPreview = (text: string): string => {
  const singleLine = text.replace(/\s+/gu, " ").trim();
  return singleLine.length > TOOL_PREVIEW_LENGTH ? `${singleLine.slice(0, TOOL_PREVIEW_LENGTH)}…` : singleLine;
};
