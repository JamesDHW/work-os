import type { RunnerId } from "@work-os/domain/identifiers/Identifiers";
import type { RunnerRequest, RunnerRequestKind } from "@work-os/domain/runners/RunnerRequest";
import type { RunnerResult } from "@work-os/domain/runners/RunnerResult";
import type { WorkOsError } from "@work-os/shared/WorkOsError";

export type RunnerResultOf<Kind extends RunnerRequestKind> = Extract<RunnerResult, { readonly kind: Kind }>;
export type RunnerRequestOf<Kind extends RunnerRequestKind> = Extract<RunnerRequest, { readonly kind: Kind }>;
export type RunnerOutputListener = (chunk: string) => void;

export type RunnerGateway = {
  readonly request: <Kind extends RunnerRequestKind>(
    runnerId: RunnerId,
    request: RunnerRequestOf<Kind>,
    onOutput?: RunnerOutputListener,
  ) => Promise<RunnerResultOf<Kind> | WorkOsError>;
  readonly isOnline: (runnerId: RunnerId) => boolean;
};
