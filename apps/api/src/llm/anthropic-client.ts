import Anthropic from "@anthropic-ai/sdk";
import type { CompletionRequest, LlmClient } from "./types.js";

export interface AnthropicClientConfig {
  readonly apiKey: string;
  readonly model?: string | undefined;
}

export class AnthropicClient implements LlmClient {
  readonly provider = "anthropic";
  private readonly client: Anthropic;
  private readonly model: string;

  constructor(config: AnthropicClientConfig) {
    this.client = new Anthropic({ apiKey: config.apiKey });
    this.model = config.model ?? "claude-sonnet-4-5";
  }

  async complete(request: CompletionRequest): Promise<string> {
    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: request.maxOutputTokens ?? 1024,
      temperature: request.temperature ?? 0.4,
      system: request.systemPrompt,
      messages: request.messages.map((message) => ({
        role: message.role,
        content: message.content,
      })),
    });

    const text = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map((block) => block.text)
      .join("");

    if (!text) {
      throw new Error("Anthropic returned an empty response");
    }
    return text;
  }
}
