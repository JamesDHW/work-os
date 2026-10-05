import { startRegistration } from "@simplewebauthn/browser";

import { apiClient } from "../api/client.ts";
import { describeFailure } from "../api/describeFailure.ts";
import { isCreationOptions } from "./isPasskeyOptions.ts";

export const registerPasskey = async (): Promise<string | null> => {
  const optionsResult = await apiClient.POST("/api/passkeys/registration-options");
  const options = optionsResult.data?.options;
  if (!isCreationOptions(options)) return describeFailure(optionsResult) ?? "The server sent invalid passkey options.";

  const response = await startRegistration({ optionsJSON: options });
  const registered = await apiClient.POST("/api/passkeys", { body: { response: { ...response, clientExtensionResults: {} } } });
  return describeFailure(registered);
};
