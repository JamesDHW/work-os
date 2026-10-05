export type DiffLineKind = "header" | "hunk" | "added" | "removed" | "context";

export type DiffLine = {
  readonly lineNumber: number;
  readonly kind: DiffLineKind;
  readonly text: string;
};

const classifyDiffLine = (text: string): DiffLineKind => {
  const isFileHeader = text.startsWith("diff ") || text.startsWith("+++") || text.startsWith("---") || text.startsWith("index ");
  if (isFileHeader) return "header";
  if (text.startsWith("@@")) return "hunk";
  if (text.startsWith("+")) return "added";
  if (text.startsWith("-")) return "removed";
  return "context";
};

export const toDiffLines = (diff: string): readonly DiffLine[] =>
  diff
    .replace(/\n$/u, "")
    .split("\n")
    .map((text, index) => ({ lineNumber: index + 1, kind: classifyDiffLine(text), text }));
