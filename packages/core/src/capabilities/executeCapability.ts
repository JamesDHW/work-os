import type { CapabilityCall } from "@work-os/domain/capabilities/CapabilityCall";
import type { Run } from "@work-os/domain/runs/Run";
import { NotFoundError } from "@work-os/shared/NotFoundError";
import { WorkOsError } from "@work-os/shared/WorkOsError";

import type { FindConnectionSecret } from "../connections/findConnectionSecret.ts";
import type { ProjectStore } from "../projects/ProjectStore.ts";
import type { RunnerGateway } from "../runners/RunnerGateway.ts";
import type { SystemClock } from "../system/SystemClock.ts";
import type { CapabilityCallStatus, CapabilityCallStore } from "./CapabilityCallStore.ts";
import type { CapabilityImplementation, HostCommand } from "./CapabilityRegistry.ts";

export type CapabilityExecutionRequest = {
  readonly run: Run;
  readonly capability: CapabilityImplementation;
  readonly taskId: string;
  readonly call: CapabilityCall;
};

type ExecuteCapabilityDependencies = {
  readonly projectStore: Pick<ProjectStore, "findProject">;
  readonly findConnectionSecret: FindConnectionSecret;
  readonly runnerGateway: Pick<RunnerGateway, "request">;
  readonly capabilityCallStore: Pick<CapabilityCallStore, "saveCapabilityCall">;
  readonly clock: SystemClock;
};

export type ExecuteCapability = (request: CapabilityExecutionRequest) => Promise<string | WorkOsError>;

export const createExecuteCapability = (dependencies: ExecuteCapabilityDependencies): ExecuteCapability => {
  return async (request) => {
    const pending = await saveCall(dependencies, request, "pending", null);
    if (pending instanceof WorkOsError) return pending;

    const secret = await readSecret(dependencies, request);
    if (secret instanceof WorkOsError) return secret;

    const result = await request.capability.execute({
      arguments: request.call.arguments,
      target: request.call.target,
      secret,
      runHostCommand: (command) => runHostCommand(dependencies, request.run, command),
    });
    const status = result instanceof WorkOsError ? "failed" : "succeeded";
    const resultText = result instanceof WorkOsError ? `Failed: ${result.message}` : result;
    const saved = await saveCall(dependencies, request, status, resultText);
    if (saved instanceof WorkOsError) return saved;

    return resultText;
  };
};

const readSecret = async (dependencies: ExecuteCapabilityDependencies, request: CapabilityExecutionRequest): Promise<string | null | WorkOsError> => {
  const project = await dependencies.projectStore.findProject(request.run.workspaceId, request.run.projectId);
  if (project instanceof WorkOsError) return project;

  const secret = await dependencies.findConnectionSecret(project, request.capability.definition.connectionKind);
  if (secret instanceof NotFoundError) return null;

  return secret;
};

const runHostCommand = async (dependencies: ExecuteCapabilityDependencies, run: Run, command: HostCommand) => {
  return dependencies.runnerGateway.request(run.spec.project.runnerId, { kind: "hostCommand", projectPath: run.spec.project.path, ...command });
};

const saveCall = async (
  dependencies: ExecuteCapabilityDependencies,
  request: CapabilityExecutionRequest,
  status: CapabilityCallStatus,
  result: string | null,
) => {
  return dependencies.capabilityCallStore.saveCapabilityCall({
    id: request.taskId,
    workspaceId: request.run.workspaceId,
    runId: request.run.id,
    capabilityId: request.call.capabilityId,
    target: request.call.target,
    arguments: request.call.arguments,
    status,
    result,
    createdAt: dependencies.clock.now(),
  });
};
