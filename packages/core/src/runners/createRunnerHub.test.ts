import { describe, expect, it } from "vitest";

import { toRunId, toRunnerId } from "@work-os/domain/identifiers/Identifiers";

import { createRunnerHub, RunnerOfflineError } from "./createRunnerHub.ts";
import type { RunnerRequestMessage } from "./RunnerHub.ts";

const runnerId = toRunnerId("runner-1");
const runId = toRunId("run-1");

const createHub = () => {
  const sentMessages: RunnerRequestMessage[] = [];
  const runnerHub = createRunnerHub({ randomSource: { createId: () => `request-${sentMessages.length + 1}` } });
  const connection = { send: (message: RunnerRequestMessage) => sentMessages.push(message) };
  return { runnerHub, connection, sentMessages };
};

describe("createRunnerHub", () => {
  it("answers a request with the runner's matching result", async () => {
    const { runnerHub, connection } = createHub();
    runnerHub.attach(runnerId, connection);

    const pending = runnerHub.request(runnerId, { kind: "stopEnvironment", runId });
    runnerHub.receive({ type: "succeeded", requestId: "request-1", result: { kind: "stopEnvironment" } });

    expect(await pending).toEqual({ kind: "stopEnvironment" });
  });

  it("streams output chunks to the caller before the result", async () => {
    const { runnerHub, connection } = createHub();
    runnerHub.attach(runnerId, connection);
    const chunks: string[] = [];

    const pending = runnerHub.request(runnerId, { kind: "exec", runId, command: "ls", timeoutSeconds: 5 }, (chunk) => chunks.push(chunk));
    runnerHub.receive({ type: "output", requestId: "request-1", chunk: "README.md\n" });
    runnerHub.receive({ type: "succeeded", requestId: "request-1", result: { kind: "exec", exitCode: 0, output: "README.md\n", isTimedOut: false } });
    await pending;

    expect(chunks).toEqual(["README.md\n"]);
  });

  it("fails pending requests when the runner disconnects", async () => {
    const { runnerHub, connection } = createHub();
    runnerHub.attach(runnerId, connection);

    const pending = runnerHub.request(runnerId, { kind: "collectChanges", runId });
    runnerHub.detach(runnerId, connection);

    expect(await pending).toBeInstanceOf(RunnerOfflineError);
  });

  it("reports an offline runner without sending anything", async () => {
    const { runnerHub, sentMessages } = createHub();

    const result = await runnerHub.request(runnerId, { kind: "collectChanges", runId });

    expect(result).toBeInstanceOf(RunnerOfflineError);
    expect(sentMessages).toEqual([]);
  });
});
