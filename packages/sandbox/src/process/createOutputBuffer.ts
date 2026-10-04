import { OUTPUT_COMPACTION_CHUNKS } from "../sandbox.constants.ts";

export type OutputBuffer = {
  readonly append: (text: string) => void;
  readonly text: () => string;
};

export const createOutputBuffer = (limitCharacters: number): OutputBuffer => {
  const chunks: string[] = [];

  const compact = (): void => {
    const retained = chunks.splice(0).join("").slice(-limitCharacters);
    chunks.push(retained);
  };

  return {
    append: (text) => {
      chunks.push(text);
      if (chunks.length > OUTPUT_COMPACTION_CHUNKS) {
        compact();
      }
    },
    text: () => chunks.join("").slice(-limitCharacters),
  };
};
