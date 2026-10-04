import { InvalidRequestError } from "@work-os/shared/InvalidRequestError";

import type { ModelReference } from "./ModelReference.ts";
import { PROVIDER_SEPARATOR } from "./resolveModelReference.constants.ts";

export class UnknownModelError extends InvalidRequestError {}

export const resolveModelReference = (
  model: string,
  aliases: Readonly<Record<string, string>>,
): ModelReference | UnknownModelError => {
  const aliasedModel = aliases[model];
  const qualifiedModel = aliasedModel ?? model;
  const separatorIndex = qualifiedModel.indexOf(PROVIDER_SEPARATOR);
  if (separatorIndex <= 0) return new UnknownModelError(`Model "${model}" is not an alias or a provider/model reference.`);

  return {
    provider: qualifiedModel.slice(0, separatorIndex),
    modelId: qualifiedModel.slice(separatorIndex + PROVIDER_SEPARATOR.length),
  };
};
