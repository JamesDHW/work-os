import type { FC } from "react";

import { StatusBadge } from "../../ui/StatusBadge/StatusBadge.tsx";
import { RUN_STATUS_LABELS, RUN_STATUS_TONES, type RunStatus } from "../runs.constants.ts";

export type RunStatusBadgeProps = {
  readonly status: RunStatus;
};

export const RunStatusBadge: FC<RunStatusBadgeProps> = ({ status }) => <StatusBadge tone={RUN_STATUS_TONES[status]} label={RUN_STATUS_LABELS[status]} />;
