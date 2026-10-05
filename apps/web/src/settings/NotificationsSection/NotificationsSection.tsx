import type { FC } from "react";

import { Button } from "../../ui/Button/Button.tsx";
import { Card } from "../../ui/Card/Card.tsx";
import { ErrorNotice } from "../../ui/ErrorNotice/ErrorNotice.tsx";
import { Heading, MutedText } from "../../ui/Heading/Heading.tsx";
import { useNotificationsSection } from "./NotificationsSection.hook.ts";

export const NotificationsSection: FC = () => {
  const model = useNotificationsSection();

  return (
    <Card>
      <Heading level="section">Notifications</Heading>
      <MutedText>Get a push notification when a run needs you. On iPhone, add work-os to the home screen first.</MutedText>
      {model.message === null ? null : <MutedText>{model.message}</MutedText>}
      <ErrorNotice message={model.errorMessage} />
      <div>
        <Button disabled={model.isBusy} onClick={model.handleEnableClick}>
          Turn on notifications here
        </Button>
      </div>
    </Card>
  );
};
