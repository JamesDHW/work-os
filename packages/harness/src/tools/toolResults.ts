import type { ToolExecutionResult } from "@earendil-works/pi-durable";

export const textResult = (text: string): ToolExecutionResult => ({ content: [{ type: "text", text }] });

export const errorResult = (text: string): ToolExecutionResult => ({ content: [{ type: "text", text }], isError: true });

export const finalResult = (text: string): ToolExecutionResult => ({ content: [{ type: "text", text }], control: { terminate: true } });
