import { InvalidRequestError } from "@work-os/shared/InvalidRequestError";

import type { ModelProviderKind } from "./ModelProvider.ts";
import { FIXED_PROVIDER_IDS, PROVIDER_ID_PATTERN } from "./modelProviders.constants.ts";

/** The provider id a kind gets: fixed for the built-in kinds, chosen (and validated) for a custom endpoint. */
export const providerIdFor = (kind: ModelProviderKind, requestedId: string): string | InvalidRequestError => {
  switch (kind) {
    case "lmStudio":
      return FIXED_PROVIDER_IDS.lmStudio;
    case "anthropic":
      return FIXED_PROVIDER_IDS.anthropic;
    case "openaiCompatible": {
      const isReservedId = requestedId === FIXED_PROVIDER_IDS.lmStudio || requestedId === FIXED_PROVIDER_IDS.anthropic;
      if (isReservedId) return new InvalidRequestError(`"${requestedId}" is reserved for the built-in ${requestedId} provider.`);
      if (!PROVIDER_ID_PATTERN.test(requestedId)) return new InvalidRequestError(`"${requestedId}" is not a provider id. Use lowercase letters, digits and hyphens.`);
      return requestedId;
    }
    default:
      return kind satisfies never;
  }
};
