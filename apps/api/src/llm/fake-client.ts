import type { CompletionRequest, LlmClient } from "./types.js";

/** Deterministic stand-in for tests — never calls a real provider. */
export class FakeLlmClient implements LlmClient {
  readonly provider = "fake";
  public readonly requests: CompletionRequest[] = [];

  constructor(private readonly response: string | ((request: CompletionRequest) => string)) {}

  async complete(request: CompletionRequest): Promise<string> {
    this.requests.push(request);
    return typeof this.response === "function" ? this.response(request) : this.response;
  }
}
