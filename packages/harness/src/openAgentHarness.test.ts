import { describe, expect, it } from "vitest";

import type { RunToolHandlers, TurnSettledInput } from "@work-os/core/runs/RunToolHandlers";
import { toAgentId, toEnvironmentId, toProjectId, toRunId, toRunnerId, toStandardId } from "@work-os/domain/identifiers/Identifiers";
import type { RunSpec } from "@work-os/domain/runs/RunSpec";
import { WorkOsError } from "@work-os/shared/WorkOsError";

import { createModelAccess } from "./models/createModelAccess.ts";
import { createScriptedProvider } from "./models/createScriptedProvider.ts";
import type { ScriptedResponse } from "./models/ScriptedResponse.ts";
import { openAgentHarness } from "./openAgentHarness.ts";

const runId = toRunId("run-1");
const spec: RunSpec = {
  runId,
  prompt: "Say hello",
  project: { id: toProjectId("project-1"), runnerId: toRunnerId("runner-1"), path: "/work/app" },
  standard: { id: toStandardId("task"), packageRevision: "abc", criteria: "", method: "", checks: [], review: "required" },
  agent: { id: toAgentId("default"), model: { provider: "scripted", modelId: "scripted" }, thinkingLevel: "off", instructions: "" },
  skills: [],
  capabilities: [],
  environment: { id: toEnvironmentId("default"), devcontainer: {}, egress: [] },
};
const silentLogger = { info: () => undefined, warn: () => undefined, error: () => undefined };

const startScriptedRun = async (responses: readonly ScriptedResponse[], overrides: Partial<RunToolHandlers>) => {
  const settled = Promise.withResolvers<TurnSettledInput>();
  const commands: string[] = [];
  const handlers: RunToolHandlers = {
    askUser: async () => "README.md",
    callCapability: async () => "ok",
    completeRun: async () => ({ message: "Checks passed.", isFinished: true }),
    execInRun: async (input) => {
      commands.push(`${input.cwd ?? ""}$ ${input.command}`);
      input.onOutput?.("hi\n");
      return { exitCode: 0, output: "hi\n", isTimedOut: false };
    },
    loadSkill: async () => "skill",
    handleTurnSettled: async (input) => (settled.resolve(input), undefined),
    reportRunActivity: async () => undefined,
    ...overrides,
  };
  const models = await createModelAccess({ lmStudioUrl: null, extraProviders: [createScriptedProvider(responses)] });
  if (models instanceof WorkOsError) return expect.unreachable(models.message);
  const harness = await openAgentHarness({ storage: { kind: "memory" }, models, handlers, logger: silentLogger });
  if (harness instanceof WorkOsError) return expect.unreachable(harness.message);

  const conversationId = await harness.agentRuntime.startConversation({ runId, spec, instructions: "Be brief.", workspacePath: "/workspace" });
  if (conversationId instanceof WorkOsError) return expect.unreachable(conversationId.message);
  await harness.agentRuntime.submitMessage({ conversationId, text: "Go", mode: "followUp", requestId: "request-1" });
  return { harness, conversationId, settled: settled.promise, commands };
};

describe("openAgentHarness", () => {
  it("runs tools through the run handlers and reports the final answer", async () => {
    const asked: string[] = [];
    const run = await startScriptedRun(
      [
        { text: "", toolCalls: [{ name: "ask_user", arguments: { question: "Which file?" } }] },
        { text: "", toolCalls: [{ name: "bash", arguments: { command: "echo hi" } }] },
        { text: "Done for now.", toolCalls: [] },
      ],
      { askUser: async (input) => (asked.push(input.question), "README.md") },
    );

    expect(await run.settled).toEqual({ runId, answerText: "Done for now." });
    expect(asked).toEqual(["Which file?"]);
    expect(run.commands).toEqual(["/workspace$ echo hi"]);
    const transcript = await run.harness.agentRuntime.readTranscript(run.conversationId);
    if (transcript instanceof WorkOsError) return expect.unreachable(transcript.message);
    expect(transcript.entries.map((entry) => entry.role)).toEqual(["user", "tool", "tool", "tool", "tool", "assistant"]);
    await run.harness.close();
  });

  it("ends the run without another model turn when complete finishes it", async () => {
    const summaries: string[] = [];
    const run = await startScriptedRun([{ text: "", toolCalls: [{ name: "complete", arguments: { summary: "Said hello." } }] }], {
      completeRun: async (input) => (summaries.push(input.summary), { message: "Checks passed.", isFinished: true }),
      handleTurnSettled: async () => undefined,
    });
    await new Promise((resolve) => setTimeout(resolve, 200));

    expect(summaries).toEqual(["Said hello."]);
    const transcript = await run.harness.agentRuntime.readTranscript(run.conversationId);
    if (transcript instanceof WorkOsError) return expect.unreachable(transcript.message);
    expect(transcript.entries.at(-1)).toMatchObject({ role: "tool", toolName: "complete", text: "Checks passed." });
    await run.harness.close();
  });
});
