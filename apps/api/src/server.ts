import { fileURLToPath } from "node:url";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import Fastify, { type FastifyBaseLogger } from "fastify";
import { loadConfig } from "./config.js";
import type { OrchestratorDeps } from "./conversation/index.js";
import { createLlmClient } from "./llm/index.js";
import { FileWriteAheadLog, GoogleSheetsLeadWriter, SmtpLeadNotifier, submitLead } from "./leads/index.js";
import type { Logger } from "./leads/types.js";
import { registerChatRoutes } from "./routes/chat.js";
import { InMemorySessionStore } from "./session/store.js";
import { CloudflareTurnstileVerifier } from "./security/turnstile.js";

function loggerAdapter(base: FastifyBaseLogger): Logger {
  return {
    error: (message, meta) => base.error(meta ?? {}, message),
    warn: (message, meta) => base.warn(meta ?? {}, message),
  };
}

export async function buildServer() {
  const config = loadConfig();
  const app = Fastify({ logger: true, trustProxy: true });

  await app.register(cors, { origin: [...config.corsOrigins], methods: ["GET", "POST"] });
  await app.register(rateLimit, { max: 30, timeWindow: "1 minute" });

  const logger = loggerAdapter(app.log);
  const llm = createLlmClient(config.llm);
  const sessionStore = new InMemorySessionStore();
  sessionStore.startCleanupInterval();

  const writeAheadLog = new FileWriteAheadLog(config.walFilePath);
  const sheetWriter = new GoogleSheetsLeadWriter({
    spreadsheetId: config.sheets.spreadsheetId,
    sheetName: config.sheets.sheetName,
    serviceAccountEmail: config.sheets.serviceAccountEmail,
    privateKey: config.sheets.privateKey,
  });
  const notifier = new SmtpLeadNotifier({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.secure,
    user: config.smtp.user,
    pass: config.smtp.pass,
    fromAddress: config.smtp.fromAddress,
    toAddress: config.smtp.toAddress,
  });

  const orchestratorDeps: OrchestratorDeps = {
    llm,
    logger,
    leadSubmitter: {
      submit: (payload) => submitLead({ writeAheadLog, sheetWriter, notifier, logger }, payload),
    },
  };

  const turnstile = new CloudflareTurnstileVerifier(config.turnstile.secretKey);

  registerChatRoutes(app, { sessionStore, orchestratorDeps, turnstile });

  return { app, config };
}

async function main() {
  const { app, config } = await buildServer();
  try {
    await app.listen({ port: config.port, host: "0.0.0.0" });
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}
