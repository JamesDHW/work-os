import type { LogFields, Logger } from "@work-os/core/system/Logger";

type LogLevel = "info" | "warn" | "error";

export const createConsoleLogger = (write: (line: string) => void): Logger => {
  const log = (level: LogLevel, message: string, fields: LogFields = {}): void => {
    write(JSON.stringify({ time: new Date().toISOString(), level, message, ...fields }));
  };
  return {
    info: (message, fields) => log("info", message, fields),
    warn: (message, fields) => log("warn", message, fields),
    error: (message, fields) => log("error", message, fields),
  };
};
