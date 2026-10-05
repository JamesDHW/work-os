import type { FC } from "react";

import { statusBadgeRecipe } from "./StatusBadge.css.ts";

export type StatusTone = "ok" | "review" | "run" | "danger" | "queued";

export type StatusBadgeProps = {
  readonly tone: StatusTone;
  readonly label: string;
};

export const StatusBadge: FC<StatusBadgeProps> = (props) => <span className={statusBadgeRecipe({ tone: props.tone })}>{props.label}</span>;
