import type { FastifyInstance } from "fastify";
import { OPENING_MESSAGE } from "@revas/flows";
import { handleUserMessage, INITIAL_STATE, type OrchestratorDeps } from "../conversation/index.js";
import type { SessionStore } from "../session/store.js";
import type { TurnstileVerifier } from "../security/turnstile.js";

export interface ChatRouteDeps {
  readonly sessionStore: SessionStore;
  readonly orchestratorDeps: OrchestratorDeps;
  readonly turnstile: TurnstileVerifier;
}

interface StartBody {
  turnstileToken?: string;
}

interface MessageBody {
  sessionId?: string;
  input?: { type?: string; value?: string };
}

export function registerChatRoutes(app: FastifyInstance, deps: ChatRouteDeps): void {
  app.post<{ Body: StartBody }>("/api/chat/start", async (request, reply) => {
    const token = request.body?.turnstileToken;
    const ok = await deps.turnstile.verify(token ?? "", request.ip);
    if (!ok) {
      return reply.status(403).send({ error: "Bot verification failed" });
    }

    const sessionId = deps.sessionStore.create();
    return reply.send({
      sessionId,
      messages: [{ text: OPENING_MESSAGE }],
      state: INITIAL_STATE.phase,
    });
  });

  app.post<{ Body: MessageBody }>("/api/chat/message", async (request, reply) => {
    const { sessionId, input } = request.body ?? {};

    if (!sessionId || !input || (input.type !== "button" && input.type !== "text") || !input.value) {
      return reply.status(400).send({ error: "Invalid request body" });
    }

    const state = deps.sessionStore.get(sessionId);
    if (!state) {
      return reply.status(404).send({ error: "Session not found or expired" });
    }

    if (input.value.length > 2000) {
      return reply.status(400).send({ error: "Message too long" });
    }

    const result = await handleUserMessage(deps.orchestratorDeps, state, {
      type: input.type,
      value: input.value,
    });

    deps.sessionStore.set(sessionId, result.state);

    return reply.send({ messages: result.messages, phase: result.state.phase });
  });

  app.get("/health", async (_request, reply) => {
    return reply.send({ status: "ok" });
  });
}
