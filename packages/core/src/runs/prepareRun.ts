import { composeRunInstructions } from "@work-os/domain/runs/composeRunInstructions";
import type { Run } from "@work-os/domain/runs/Run";
import { WorkOsError } from "@work-os/shared/WorkOsError";

import type { RunnerGateway } from "../runners/RunnerGateway.ts";
import type { Logger } from "../system/Logger.ts";
import type { AgentRuntime } from "./AgentRuntime.ts";
import type { TransitionRun } from "./transitionRun.ts";

export type RunMessage = {
  readonly text: string;
  readonly requestId: string;
};

type PrepareRunDependencies = {
  readonly runnerGateway: Pick<RunnerGateway, "request">;
  readonly agentRuntime: Pick<AgentRuntime, "startConversation" | "watchConversation" | "submitMessage">;
  readonly transitionRun: TransitionRun;
  readonly logger: Logger;
};

export type PrepareRun = (run: Run, message: RunMessage) => Promise<undefined>;

export const createPrepareRun = (dependencies: PrepareRunDependencies): PrepareRun => {
  return async (run, message) => {
    const started = await startEnvironmentAndAgent(dependencies, run, message);
    if (!(started instanceof WorkOsError)) return undefined;

    dependencies.logger.error("Run preparation failed.", { runId: run.id, message: started.message });
    await dependencies.transitionRun({ run, event: { kind: "failed", message: started.message } });
    return undefined;
  };
};

const startEnvironmentAndAgent = async (dependencies: PrepareRunDependencies, run: Run, message: RunMessage) => {
  const environment = await dependencies.runnerGateway.request(run.spec.project.runnerId, {
    kind: "prepareEnvironment",
    runId: run.id,
    projectPath: run.spec.project.path,
    devcontainer: run.spec.environment.devcontainer,
    egress: run.spec.environment.egress,
  });
  if (environment instanceof WorkOsError) return environment;

  const conversationId = await ensureConversation(dependencies, run, environment.workspacePath);
  if (conversationId instanceof WorkOsError) return conversationId;

  const running = await dependencies.transitionRun({ run, event: { kind: "environmentReady" }, change: { conversationId } });
  if (running instanceof WorkOsError) return running;

  const watched = await dependencies.agentRuntime.watchConversation(run.id, conversationId);
  if (watched instanceof WorkOsError) return watched;

  return dependencies.agentRuntime.submitMessage({ conversationId, text: message.text, mode: "followUp", requestId: message.requestId });
};

const ensureConversation = async (dependencies: PrepareRunDependencies, run: Run, workspacePath: string): Promise<string | WorkOsError> => {
  if (run.conversationId !== null) return run.conversationId;

  const instructions = composeRunInstructions(run.spec);
  return dependencies.agentRuntime.startConversation({ runId: run.id, spec: run.spec, instructions, workspacePath });
};
