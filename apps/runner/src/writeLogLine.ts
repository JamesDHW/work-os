import process from "process";

export type LogFields = Readonly<Record<string, string | number | boolean | null>>;

export const writeLogLine = (level: "info" | "warn" | "error", message: string, fields: LogFields = {}): void => {
  process.stdout.write(`${JSON.stringify({ time: new Date().toISOString(), level, message, ...fields })}\n`);
};
