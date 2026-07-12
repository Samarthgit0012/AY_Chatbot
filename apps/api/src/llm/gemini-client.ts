import { GoogleGenAI } from "@google/genai";
import type { ChatMessage, CompletionRequest, LlmClient } from "./types.js";

export interface GeminiClientConfig {
  readonly apiKey: string;
  readonly model?: string | undefined;
}

function toGeminiContents(messages: readonly ChatMessage[]) {
  return messages.map((message) => ({
    role: message.role === "assistant" ? "model" : "user",
    parts: [{ text: message.content }],
  }));
}

export class GeminiClient implements LlmClient {
  readonly provider = "gemini";
  private readonly client: GoogleGenAI;
  private readonly model: string;

  constructor(config: GeminiClientConfig) {
    this.client = new GoogleGenAI({ apiKey: config.apiKey });
    this.model = config.model ?? "gemini-3.1-flash-lite";
  }

  async complete(request: CompletionRequest): Promise<string> {
    const response = await this.client.models.generateContent({
      model: this.model,
      contents: toGeminiContents(request.messages),
      config: {
        systemInstruction: request.systemPrompt,
        maxOutputTokens: request.maxOutputTokens ?? 1024,
        temperature: request.temperature ?? 0.4,
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("Gemini returned an empty response");
    }
    return text;
  }
}
