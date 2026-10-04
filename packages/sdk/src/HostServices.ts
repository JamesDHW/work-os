import type { JsonValue } from "@work-os/domain/json/Json";
import type { CommandOutcome } from "@work-os/domain/runners/RunnerResult";

import type { CapabilityError } from "./CapabilityError.ts";

export type HttpRequest = {
  readonly method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  readonly url: string;
  readonly headers: Readonly<Record<string, string>>;
  readonly body?: JsonValue;
};

export type HttpResponse = {
  readonly status: number;
  readonly body: JsonValue | string;
};

export type HttpClient = {
  readonly send: (request: HttpRequest) => Promise<HttpResponse | CapabilityError>;
};

export type HostGitCommand = {
  readonly arguments: readonly string[];
  readonly credential?: { readonly username: string; readonly secret: string };
};

export type WorkspaceFiles = {
  readonly readFile: (path: string) => Promise<string | CapabilityError>;
  readonly writeFiles: (files: Readonly<Record<string, string>>, message: string) => Promise<string | CapabilityError>;
};

export type HostServices = {
  readonly http: HttpClient;
  readonly workspaceFiles: WorkspaceFiles;
  readonly runGit: (command: HostGitCommand) => Promise<CommandOutcome | CapabilityError>;
};
