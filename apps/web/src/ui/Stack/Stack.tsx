import type { FC, ReactNode } from "react";

import { stackRecipe } from "./Stack.css.ts";

export type StackProps = {
  readonly children: ReactNode;
  readonly direction?: "column" | "row";
  readonly gap?: "sm" | "md" | "lg";
  readonly justify?: "start" | "between" | "end";
};

export const Stack: FC<StackProps> = ({ children, ...layout }) => <div className={stackRecipe(layout)}>{children}</div>;
