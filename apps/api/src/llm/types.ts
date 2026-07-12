export interface ChatMessage {
  readonly role: "user" | "assistant";
  readonly content: string;
}

export interface CompletionRequest {
  readonly systemPrompt: string;
  readonly messages: readonly ChatMessage[];
  readonly maxOutputTokens?: number;
  readonly temperature?: number;
}

/**
 * The only surface the state machine, guardrail filter, and intent router are
 * allowed to depend on. No vendor SDK (Gemini, Anthropic, or anything added
 * later) is ever imported outside this directory — swapping or adding a
 * provider is a config change, not a rewrite of application logic.
 */
export interface LlmClient {
  readonly provider: string;
  complete(request: CompletionRequest): Promise<string>;
}
