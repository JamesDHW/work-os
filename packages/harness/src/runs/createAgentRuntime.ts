import { BACKGROUND_CONTEXT } from "@earendil-works/chord/context";
import type { Conversation, Harness } from "@earendil-works/pi-durable";
import type { AgentRuntime, StartConversationInput } from "@work-os/core/runs/AgentRuntime";
import type { RunToolHandlers } from "@work-os/core/runs/RunToolHandlers";
import type { Logger } from "@work-os/core/system/Logger";
import type { RunId } from "@work-os/domain/identifiers/Identifiers";
import { NotFoundError } from "@work-os/shared/NotFoundError";
import { tryCatchAsync } from "@work-os/shared/tryCatch";
import { WorkOsError } from "@work-os/shared/WorkOsError";

import { createConversationWatchers } from "./createConversationWatchers.ts";
import { findSettledAnswer } from "./findSettledAnswer.ts";
import { readRunId } from "./readRunId.ts";
import { readStreamingText } from "./readStreamingText.ts";
import { RunLinkDoc } from "./RunLinkDoc.ts";
import { toConversationId } from "./toConversationId.ts";
import { toTranscript } from "./toTranscript.ts";

export type AgentRuntimeOptions = {
  readonly harness: Harness;
  readonly handlers: RunToolHandlers;
  readonly logger: Logger;
};

export type ClosableAgentRuntime = AgentRuntime & { readonly stopWatching: () => undefined };

export const createAgentRuntime = (options: AgentRuntimeOptions): ClosableAgentRuntime => {
  const { harness, handlers, logger } = options;
  const watchers = createConversationWatchers(handlers.reportRunActivity);

  const openConversation = async (conversationId: string): Promise<Conversation | WorkOsError> => {
    const id = toConversationId(conversationId);
    if (id instanceof WorkOsError) return id;

    const conversation = await tryCatchAsync(() => harness.conversation(id, BACKGROUND_CONTEXT));
    if (conversation instanceof WorkOsError) return conversation;
    if (conversation === undefined) return new NotFoundError(`Conversation ${conversationId} does not exist.`);
    return conversation;
  };

  const settleWhenIdle = async (conversation: Conversation): Promise<undefined> => {
    const settled = await tryCatchAsync(async () => {
      await conversation.waitForIdle(BACKGROUND_CONTEXT);
      const runId = await readRunId(harness, conversation.id, BACKGROUND_CONTEXT);
      const view = await conversation.context(BACKGROUND_CONTEXT);
      return { runId, answer: findSettledAnswer(view.messages) };
    });
    if (settled instanceof WorkOsError) {
      logger.warn("Could not observe a conversation.", { message: settled.message });
      return undefined;
    }
    const { runId, answer } = settled;
    const hasAnswer = runId !== null && answer !== null;
    if (hasAnswer) {
      await handlers.handleTurnSettled({ runId, answerText: answer });
    }
    return undefined;
  };

  return {
    startConversation: async (input) => startConversation(harness, input),
    submitMessage: async (input) => {
      const conversation = await openConversation(input.conversationId);
      if (conversation instanceof WorkOsError) return conversation;

      const submission = { type: "input", content: input.text, requestId: input.requestId, whenBusy: input.mode } as const;
      const submitted = await tryCatchAsync(() => conversation.submit(submission, BACKGROUND_CONTEXT));
      if (submitted instanceof WorkOsError) return submitted;

      void settleWhenIdle(conversation);
      return undefined;
    },
    readTranscript: async (conversationId) => {
      const conversation = await openConversation(conversationId);
      if (conversation instanceof WorkOsError) return conversation;

      return tryCatchAsync(async () => {
        const view = await conversation.context(BACKGROUND_CONTEXT);
        return { entries: toTranscript(view.entries), streamingText: await readStreamingText(harness, conversation.id, BACKGROUND_CONTEXT) };
      });
    },
    stopConversation: async (conversationId) => {
      const conversation = await openConversation(conversationId);
      if (conversation instanceof WorkOsError) return conversation;

      const aborted = await tryCatchAsync(() => conversation.abort(BACKGROUND_CONTEXT));
      return aborted instanceof WorkOsError ? aborted : undefined;
    },
    watchConversation: async (runId: RunId, conversationId) => {
      const conversation = await openConversation(conversationId);
      if (conversation instanceof WorkOsError) return conversation;

      const watched = await tryCatchAsync(() => watchers.watch(runId, conversation));
      if (watched instanceof WorkOsError) return watched;

      void settleWhenIdle(conversation);
      return undefined;
    },
    stopWatching: () => watchers.stopAll(),
  };
};

const startConversation = async (harness: Harness, input: StartConversationInput): Promise<string | WorkOsError> => {
  const conversation = await tryCatchAsync(() =>
    harness.createConversation(
      {
        ownership: { kind: "ownerless" },
        agent: {
          model: input.spec.agent.model,
          thinkingLevel: input.spec.agent.thinkingLevel,
          instructions: input.instructions,
          cwd: input.workspacePath,
        },
        init: async (transaction, conversationId) => {
          const link = await transaction.doc(RunLinkDoc, conversationId);
          link.runId = input.runId;
        },
      },
      BACKGROUND_CONTEXT,
    ),
  );
  if (conversation instanceof WorkOsError) return conversation;

  return String(conversation.id);
};
