import type { FC } from "react";

import type { Capability } from "../../api/apiTypes.ts";
import { Button } from "../../ui/Button/Button.tsx";
import { ErrorNotice } from "../../ui/ErrorNotice/ErrorNotice.tsx";
import { SelectInput } from "../../ui/Field/SelectInput.tsx";
import { Stack } from "../../ui/Stack/Stack.tsx";
import { useAddCapability } from "./AddCapability.hook.ts";

export type AddCapabilityProps = {
  readonly workspaceId: string;
  readonly runId: string;
  readonly availableCapabilities: readonly Capability[];
};

export const AddCapability: FC<AddCapabilityProps> = (props) => {
  const model = useAddCapability(props.workspaceId, props.runId, props.availableCapabilities[0]?.id ?? "");
  if (props.availableCapabilities.length === 0) return null;

  return (
    <Stack gap="sm">
      <Stack direction="row" gap="sm">
        <SelectInput value={model.capabilityId} onChange={model.handleCapabilityChange} aria-label="Capability to add">
          {props.availableCapabilities.map((capability) => (
            <option key={capability.id} value={capability.id}>
              {capability.id} ({capability.effect})
            </option>
          ))}
        </SelectInput>
        <Button disabled={model.isBusy} onClick={model.handleAddClick}>
          Add to this run
        </Button>
      </Stack>
      <ErrorNotice message={model.errorMessage} />
    </Stack>
  );
};
