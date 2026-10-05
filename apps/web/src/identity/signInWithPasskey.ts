import { startAuthentication } from "@simplewebauthn/browser";

import { apiClient } from "../api/client.ts";
import { describeFailure } from "../api/describeFailure.ts";
import { isRequestOptions } from "./isPasskeyOptions.ts";

export const signInWithPasskey = async (): Promise<string | null> => {
  const optionsResult = await apiClient.POST("/api/passkeys/sign-in-options");
  const options = optionsResult.data?.options;
  if (!isRequestOptions(options)) return describeFailure(optionsResult) ?? "The server sent invalid passkey options.";

  const response = await startAuthentication({ optionsJSON: options });
  const signedIn = await apiClient.POST("/api/passkeys/sign-in", { body: { response: { ...response, clientExtensionResults: {} } } });
  return describeFailure(signedIn);
};
