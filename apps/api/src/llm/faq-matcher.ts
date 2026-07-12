import type { FaqEntry } from "@revas/flows";
import type { LlmClient } from "./types.js";

/**
 * Matches free text to the single closest scripted FAQ, if any — retrieval,
 * not generation (PLAN.md §5.2). The LLM only ever picks an id from the
 * provided list; the answer text returned to the user is always the
 * verbatim scripted answer, never something the model writes itself.
 */
export async function matchFaq(
  llm: LlmClient,
  userText: string,
  faqs: readonly FaqEntry[],
): Promise<FaqEntry | null> {
  if (faqs.length === 0) return null;

  const raw = await llm.complete({
    systemPrompt:
      "You match a user's question to the single closest FAQ from a fixed list for an insurance agency's " +
      'chat assistant. Respond with ONLY the exact id of the best match, or "NONE" if nothing is a reasonable ' +
      "match. Never explain, never invent an id that isn't in the list.",
    messages: [
      {
        role: "user",
        content: `FAQs:\n${faqs.map((f) => `id="${f.id}" question="${f.question}"`).join("\n")}\n\nUser question: "${userText}"`,
      },
    ],
    maxOutputTokens: 32,
    temperature: 0,
  });

  const trimmedId = raw.trim();
  return faqs.find((f) => f.id === trimmedId) ?? null;
}
