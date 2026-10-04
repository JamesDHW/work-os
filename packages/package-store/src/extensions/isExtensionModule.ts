import type { Extension } from "@work-os/sdk/defineExtension";
import { WorkOsError } from "@work-os/shared/WorkOsError";

export class InvalidExtensionError extends WorkOsError {}

export type ExtensionModule = {
  readonly extension: Extension;
};

export const isExtensionModule = (value: unknown): value is ExtensionModule => {
  const hasExtension = isObject(value) && "extension" in value;
  if (!hasExtension) return false;

  return isExtension(value.extension);
};

const isExtension = (value: unknown): boolean => {
  const hasFields = isObject(value) && "name" in value && "capabilities" in value;
  if (!hasFields) return false;

  const hasValidCapabilities = Array.isArray(value.capabilities) && value.capabilities.every(isCapability);
  return typeof value.name === "string" && hasValidCapabilities;
};

const isCapability = (value: unknown): boolean => {
  const hasFields = isObject(value) && "id" in value && "execute" in value;
  if (!hasFields) return false;

  return typeof value.id === "string" && typeof value.execute === "function";
};

const isObject = (value: unknown): value is object => typeof value === "object" && value !== null;
