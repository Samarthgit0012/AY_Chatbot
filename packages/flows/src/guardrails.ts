/**
 * Source: docx §18 "Recommended Compliance Guardrails".
 * Each banned phrase is matched case-insensitively and tolerant of minor
 * wording drift (see apps/api guardrail filter for the matching logic) —
 * this list is the canonical source of what must never reach the user.
 */
export const BANNED_PHRASES = [
  "you are covered",
  "this claim will be paid",
  "this is guaranteed",
  "you don't need that coverage",
  "you do not need that coverage",
  "this is the best policy",
  "you qualify for this rate",
  "cancel your current policy now",
] as const;

export const REQUIRED_PHRASING_EXAMPLES = [
  "A licensed agent can review this",
  "Coverage depends on the policy terms",
  "The carrier makes the final underwriting decision",
  "Do not cancel existing coverage until new coverage is confirmed",
  "This is general information, not a final coverage determination",
] as const;

export const GUARDRAIL_FALLBACK_MESSAGE =
  "A licensed agent can review this with you directly — coverage and final terms are always determined by the carrier's underwriting decision. Would you like me to connect you with one?";
