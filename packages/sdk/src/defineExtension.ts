import type { ExtensionCapability } from "./defineCapability.ts";

export type Extension = {
  readonly name: string;
  readonly capabilities: readonly ExtensionCapability[];
};

export const defineExtension = (extension: Extension): Extension => extension;
