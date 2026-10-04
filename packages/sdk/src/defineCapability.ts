import type { CapabilityEffect, CapabilityExecutionSite } from "@work-os/domain/capabilities/CapabilityDefinition";
import type { JsonObject } from "@work-os/domain/json/Json";
import type { z } from "zod";

import { CapabilityError } from "./CapabilityError.ts";
import type { HostServices } from "./HostServices.ts";

export type CapabilityContext<Arguments> = HostServices & {
  readonly arguments: Arguments;
  readonly target: string;
  readonly secret: string | null;
};

export type CapabilityDeclaration<Arguments> = {
  readonly id: string;
  readonly connectionKind: string;
  readonly description: string;
  readonly effect: CapabilityEffect;
  readonly executionSite: CapabilityExecutionSite;
  readonly editableFields: readonly string[];
  readonly argumentsSchema: z.ZodType<Arguments>;
  readonly execute: (context: CapabilityContext<Arguments>) => Promise<string | CapabilityError>;
};

export type ExtensionCapability = Omit<CapabilityDeclaration<JsonObject>, "argumentsSchema" | "execute"> & {
  readonly execute: (context: CapabilityContext<JsonObject>) => Promise<string | CapabilityError>;
};

export const defineCapability = <Arguments>(declaration: CapabilityDeclaration<Arguments>): ExtensionCapability => {
  const { argumentsSchema, execute, ...metadata } = declaration;

  return {
    ...metadata,
    execute: async (context) => {
      const parsed = argumentsSchema.safeParse(context.arguments);
      if (!parsed.success) return new CapabilityError(`Invalid arguments for ${declaration.id}: ${parsed.error.message}`);

      return execute({ ...context, arguments: parsed.data });
    },
  };
};
