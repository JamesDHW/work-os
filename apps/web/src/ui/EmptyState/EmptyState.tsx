import type { FC, ReactNode } from "react";

import { emptyState } from "./EmptyState.css.ts";

export type EmptyStateProps = {
  readonly children: ReactNode;
};

export const EmptyState: FC<EmptyStateProps> = ({ children }) => <div className={emptyState}>{children}</div>;
