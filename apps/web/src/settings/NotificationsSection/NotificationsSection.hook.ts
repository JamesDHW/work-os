import { useState } from "react";

import { captureFailure } from "../../api/captureFailure.ts";
import { enablePushNotifications } from "./enablePushNotifications.ts";

export type NotificationsSectionModel = {
  readonly message: string | null;
  readonly errorMessage: string | null;
  readonly isBusy: boolean;
  readonly handleEnableClick: () => Promise<void>;
};

export const useNotificationsSection = (): NotificationsSectionModel => {
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  const enableNotifications = async (): Promise<void> => {
    setIsBusy(true);
    const failure = await captureFailure(enablePushNotifications);
    setIsBusy(false);
    setErrorMessage(failure);
    setMessage(failure === null ? "Notifications are on for this device." : null);
  };

  return { message, errorMessage, isBusy, handleEnableClick: enableNotifications };
};
