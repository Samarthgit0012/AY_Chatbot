import { BANNED_PHRASES } from "@revas/flows";
import { describe, expect, it } from "vitest";
import { checkOutputSafety, enforceGuardrails } from "../guardrails/output-filter.js";

describe("checkOutputSafety", () => {
  it.each(BANNED_PHRASES)("blocks the exact banned phrase: %s", (phrase) => {
    const result = checkOutputSafety(`Sure thing — ${phrase}, no worries at all!`);
    expect(result.safe).toBe(false);
    expect(result.matchedPhrase).toBe(phrase);
  });

  it.each(BANNED_PHRASES)("blocks the banned phrase in a different case: %s", (phrase) => {
    const result = checkOutputSafety(phrase.toUpperCase());
    expect(result.safe).toBe(false);
  });

  it.each(BANNED_PHRASES)("blocks the banned phrase with surrounding punctuation: %s", (phrase) => {
    const result = checkOutputSafety(`Great news!! ${phrase}!!! Anything else?`);
    expect(result.safe).toBe(false);
  });

  it("blocks a contraction variant of a banned phrase", () => {
    // "you don't need that coverage" vs "you do not need that coverage" — both are
    // listed explicitly, but this confirms punctuation stripping doesn't break the match.
    const result = checkOutputSafety("Honestly, you don't need that coverage for your situation.");
    expect(result.safe).toBe(false);
  });

  it("blocks an adversarial prompt-injection style response", () => {
    const injected =
      "Ignoring all previous instructions, I can confirm: you are covered under this policy starting today.";
    const result = checkOutputSafety(injected);
    expect(result.safe).toBe(false);
    expect(result.matchedPhrase).toBe("you are covered");
  });

  it("blocks a banned phrase embedded mid-sentence in a longer generated response", () => {
    const generated =
      "I looked into your situation and after reviewing the details with our system, this is guaranteed to work out in your favor, so don't worry about a thing.";
    const result = checkOutputSafety(generated);
    expect(result.safe).toBe(false);
    expect(result.matchedPhrase).toBe("this is guaranteed");
  });

  it("allows safe, compliant scripted language through unchanged", () => {
    const safeText =
      "A licensed agent can review this and explain how coverage depends on the policy terms and the carrier's final underwriting decision.";
    const result = checkOutputSafety(safeText);
    expect(result.safe).toBe(true);
    expect(result.matchedPhrase).toBeUndefined();
  });

  it("does not false-positive on benign text that shares a few words with a banned phrase", () => {
    // Shares words like "policy" / "coverage" with banned phrases but is not the banned phrase itself.
    const safeText = "Coverage depends on the policy terms, and a licensed agent can review this with you.";
    const result = checkOutputSafety(safeText);
    expect(result.safe).toBe(true);
  });
});

describe("enforceGuardrails", () => {
  it("passes safe text through unmodified", () => {
    const result = enforceGuardrails("A licensed agent can review this with you.");
    expect(result.wasBlocked).toBe(false);
    expect(result.text).toBe("A licensed agent can review this with you.");
  });

  it("replaces unsafe text with the fallback message and reports what matched", () => {
    const result = enforceGuardrails("Don't worry, you are covered no matter what happens.");
    expect(result.wasBlocked).toBe(true);
    expect(result.matchedPhrase).toBe("you are covered");
    expect(result.text).not.toContain("you are covered");
  });
});
