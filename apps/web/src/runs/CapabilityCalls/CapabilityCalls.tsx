import type { FC } from "react";

import type { CapabilityCallRecord } from "../../api/apiTypes.ts";
import { EmptyState } from "../../ui/EmptyState/EmptyState.tsx";
import { Stack } from "../../ui/Stack/Stack.tsx";
import { StatusBadge } from "../../ui/StatusBadge/StatusBadge.tsx";
import { CALL_STATUS_TONES } from "../runs.constants.ts";
import { callList, callResult, callRow } from "./CapabilityCalls.css.ts";

export type CapabilityCallsProps = {
  readonly calls: readonly CapabilityCallRecord[];
};

export const CapabilityCalls: FC<CapabilityCallsProps> = (props) => {
  if (props.calls.length === 0) return <EmptyState>No capability calls yet.</EmptyState>;

  return (
    <ul className={callList}>
      {props.calls.map((call) => (
        <li key={call.id} className={callRow}>
          <Stack direction="row" gap="sm">
            <StatusBadge tone={CALL_STATUS_TONES[call.status]} label={call.status} />
            <strong>{call.capabilityId}</strong>
            <span>{call.target}</span>
          </Stack>
          {call.result === null ? null : <pre className={callResult}>{call.result}</pre>}
        </li>
      ))}
    </ul>
  );
};
