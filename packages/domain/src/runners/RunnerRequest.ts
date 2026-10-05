import type { RunId } from "../identifiers/Identifiers.ts";
import type { JsonObject } from "../json/Json.ts";

export type HostCredential = {
  readonly username: string;
  readonly secret: string;
};

export type RunnerRequest =
  | {
      readonly kind: "prepareEnvironment";
      readonly runId: RunId;
      readonly projectPath: string;
      readonly devcontainer: JsonObject;
      readonly egress: readonly string[];
    }
  | { readonly kind: "stopEnvironment"; readonly runId: RunId }
  | {
      readonly kind: "exec";
      readonly runId: RunId;
      readonly command: string;
      readonly stdin?: string | undefined;
      readonly cwd?: string | undefined;
      readonly timeoutSeconds: number;
      readonly streamsOutput?: true | undefined;
    }
  | { readonly kind: "collectChanges"; readonly runId: RunId }
  | {
      readonly kind: "hostCommand";
      readonly projectPath: string;
      readonly program: "git";
      readonly arguments: readonly string[];
      readonly credential?: HostCredential | undefined;
    }
  | { readonly kind: "listFolders"; readonly path?: string | undefined };

export type RunnerRequestKind = RunnerRequest["kind"];
