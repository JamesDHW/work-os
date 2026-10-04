import type { RunnerId } from "@work-os/domain/identifiers/Identifiers";
import type { RunnerRequest } from "@work-os/domain/runners/RunnerRequest";
import type { RunnerResult } from "@work-os/domain/runners/RunnerResult";

import type { RunnerGateway } from "./RunnerGateway.ts";

export type RunnerRequestMessage = {
  readonly type: "request";
  readonly requestId: string;
  readonly request: RunnerRequest;
};

export type RunnerReply =
  | { readonly type: "succeeded"; readonly requestId: string; readonly result: RunnerResult }
  | { readonly type: "failed"; readonly requestId: string; readonly message: string }
  | { readonly type: "output"; readonly requestId: string; readonly chunk: string };

export type RunnerConnection = {
  readonly send: (message: RunnerRequestMessage) => void;
};

export type RunnerHub = RunnerGateway & {
  readonly attach: (runnerId: RunnerId, connection: RunnerConnection) => void;
  readonly detach: (runnerId: RunnerId, connection: RunnerConnection) => void;
  readonly receive: (reply: RunnerReply) => void;
};
