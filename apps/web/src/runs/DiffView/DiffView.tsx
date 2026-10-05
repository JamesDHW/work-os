import type { FC } from "react";

import { diffLineRecipe, diffView } from "./DiffView.css.ts";
import { toDiffLines } from "./toDiffLines.ts";

export type DiffViewProps = {
  readonly diff: string;
};

export const DiffView: FC<DiffViewProps> = (props) => (
  <pre className={diffView}>
    {toDiffLines(props.diff).map((line) => (
      <code key={line.lineNumber} className={diffLineRecipe({ kind: line.kind })}>
        {line.text}
      </code>
    ))}
  </pre>
);
