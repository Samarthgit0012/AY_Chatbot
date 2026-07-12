import type { LlmClient } from "./types.js";

/**
 * Classifies free text against a fixed set of candidate options (button
 * labels valid in the current conversation state). Returns the exact
 * candidate string on a confident match, or null — never invents an option
 * outside the provided list, since the result feeds directly back into the
 * deterministic engine as if it were a button click.
 */
export async function routeIntent(
  llm: LlmClient,
  userText: string,
  candidates: readonly string[],
): Promise<string | null> {
  if (candidates.length === 0) return null;

  const raw = await llm.complete({
    systemPrompt:
      "You are a strict intent classifier for an insurance agency's chat assistant. " +
      "Respond with ONLY the exact text of the single best-matching option from the list, " +
      'copied verbatim, or the exact word "NONE" if nothing matches well. Never explain, never add punctuation.',
    messages: [
      {
        role: "user",
        content: `Options:\n${candidates.map((c) => `- ${c}`).join("\n")}\n\nUser message: "${userText}"`,
      },
    ],
    maxOutputTokens: 32,
    temperature: 0,
  });

  const trimmed = raw.trim();
  return candidates.find((c) => c.toLowerCase() === trimmed.toLowerCase()) ?? null;
}
