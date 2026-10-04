import type { JsonObject } from "@work-os/domain/json/Json";

export type ScriptedToolCall = {
  readonly name: string;
  readonly arguments: JsonObject;
};

export type ScriptedResponse = {
  readonly text: string;
  readonly toolCalls: readonly ScriptedToolCall[];
};
