import type { FC } from "react";

import { Button } from "../../ui/Button/Button.tsx";
import { Card } from "../../ui/Card/Card.tsx";
import { ErrorNotice } from "../../ui/ErrorNotice/ErrorNotice.tsx";
import { Heading, MutedText } from "../../ui/Heading/Heading.tsx";
import { Icon } from "../../ui/Icon/Icon.tsx";
import { usePasskeysSection } from "./PasskeysSection.hook.ts";

export const PasskeysSection: FC = () => {
  const model = usePasskeysSection();

  return (
    <Card>
      <Heading level="section">Passkeys</Heading>
      <MutedText>Add a passkey on each device you use, such as your phone, so you can sign in there.</MutedText>
      {model.message === null ? null : <MutedText>{model.message}</MutedText>}
      <ErrorNotice message={model.errorMessage} />
      <div>
        <Button disabled={model.isBusy} onClick={model.handleAddClick}>
          <Icon name="key" />
          Add a passkey on this device
        </Button>
      </div>
    </Card>
  );
};
