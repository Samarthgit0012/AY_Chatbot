import { AnthropicClient } from "./anthropic-client.js";
import { GeminiClient } from "./gemini-client.js";
import type { LlmClient } from "./types.js";

export type LlmProvider = "gemini" | "anthropic";

export interface LlmConfig {
  readonly provider: LlmProvider;
  readonly apiKey: string;
  readonly model?: string | undefined;
}

export function createLlmClient(config: LlmConfig): LlmClient {
  switch (config.provider) {
    case "gemini":
      return new GeminiClient({ apiKey: config.apiKey, model: config.model });
    case "anthropic":
      return new AnthropicClient({ apiKey: config.apiKey, model: config.model });
    default: {
      const exhaustiveCheck: never = config.provider;
      throw new Error(`Unsupported LLM provider: ${String(exhaustiveCheck)}`);
    }
  }
}

/** Reads LLM_PROVIDER / LLM_API_KEY / LLM_MODEL from the environment. Defaults to Gemini. */
export function createLlmClientFromEnv(env: NodeJS.ProcessEnv = process.env): LlmClient {
  const provider = (env.LLM_PROVIDER ?? "gemini") as LlmProvider;
  const apiKey = env.LLM_API_KEY;
  if (!apiKey) {
    throw new Error("LLM_API_KEY is not set");
  }
  return createLlmClient({ provider, apiKey, model: env.LLM_MODEL });
}
