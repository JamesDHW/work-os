import type { FC } from "react";

import { StatusBadge } from "../../ui/StatusBadge/StatusBadge.tsx";
import { RUN_STATUS_LABELS, RUN_STATUS_TONES, type RunStatus } from "../runs.constants.ts";

export type RunStatusBadgeProps = {
  readonly status: RunStatus;
};

export const RunStatusBadge: FC<RunStatusBadgeProps> = (props) => <StatusBadge tone={RUN_STATUS_TONES[props.status]} label={RUN_STATUS_LABELS[props.status]} />;
