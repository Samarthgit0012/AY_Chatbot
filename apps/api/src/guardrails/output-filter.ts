import { BANNED_PHRASES, GUARDRAIL_FALLBACK_MESSAGE } from "@revas/flows";

export interface GuardrailCheckResult {
  readonly safe: boolean;
  readonly matchedPhrase?: string | undefined;
}

export interface GuardrailEnforcementResult {
  readonly text: string;
  readonly wasBlocked: boolean;
  readonly matchedPhrase?: string | undefined;
}

/**
 * Normalizes for fuzzy matching: lowercases, strips punctuation/apostrophes,
 * and collapses whitespace. This deliberately over-matches rather than
 * under-matches — a false positive costs a slightly generic fallback
 * response; a false negative costs a compliance violation reaching a user.
 */
function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function checkOutputSafety(text: string): GuardrailCheckResult {
  const normalized = normalize(text);
  for (const phrase of BANNED_PHRASES) {
    if (normalized.includes(normalize(phrase))) {
      return { safe: false, matchedPhrase: phrase };
    }
  }
  return { safe: true };
}

/**
 * The single choke point every outbound bot message must pass through
 * before reaching a user, regardless of whether it was scripted or
 * LLM-generated. See PLAN.md §5.2 (defense-in-depth guardrail system).
 */
export function enforceGuardrails(text: string): GuardrailEnforcementResult {
  const result = checkOutputSafety(text);
  if (result.safe) {
    return { text, wasBlocked: false };
  }
  return {
    text: GUARDRAIL_FALLBACK_MESSAGE,
    wasBlocked: true,
    matchedPhrase: result.matchedPhrase,
  };
}
