import { FLOWS_BY_LINE, UNIVERSAL_LEAD_FIELDS } from "@revas/flows";
import { describe, expect, it } from "vitest";
import { transition } from "../conversation/engine.js";
import { INITIAL_STATE, type ConversationState, type EngineOutcome } from "../conversation/types.js";

function button(value: string) {
  return { type: "button" as const, value };
}
function text(value: string) {
  return { type: "text" as const, value };
}

function requireHandled(outcome: EngineOutcome) {
  if (outcome.kind !== "handled") {
    throw new Error("Expected a handled outcome");
  }
  return outcome.result;
}

/** Drives every universal lead field with a placeholder answer, returning the final result. */
function fillLeadCapture(state: ConversationState) {
  let current = state;
  let last: ReturnType<typeof requireHandled> | undefined;
  for (let i = 0; i < UNIVERSAL_LEAD_FIELDS.length; i += 1) {
    const result = requireHandled(transition(current, text(`answer-${i}`)));
    current = result.state;
    last = result;
  }
  if (!last) throw new Error("No lead fields to fill");
  return last;
}

describe("conversation engine — trucking happy path", () => {
  it("collects state, routes to trucking, completes qualification, and produces a lead on lead capture completion", () => {
    let result = requireHandled(transition(INITIAL_STATE, text("Oregon")));
    expect(result.state.phase).toBe("mainMenu");
    expect(result.state.userState).toBe("OR");

    result = requireHandled(transition(result.state, button("Commercial Trucking")));
    expect(result.state.phase).toBe("lineEntry");
    expect(result.state.selectedLine).toBe("trucking");

    result = requireHandled(transition(result.state, button("Owner-operator")));
    expect(result.state.phase).toBe("qualification");
    expect(result.state.qualificationIndex).toBe(0);

    // Walk through all trucking qualification questions.
    let current = result.state;
    const questionCount = FLOWS_BY_LINE.trucking.qualificationQuestions.length;
    for (let i = 0; i < questionCount; i += 1) {
      const step = requireHandled(transition(current, button("some-answer")));
      current = step.state;
    }
    expect(current.phase).toBe("leadCapture");

    const final = fillLeadCapture(current);
    expect(final.state.phase).toBe("cta");
    expect(final.leadCompleted).toBeDefined();
    expect(final.leadCompleted?.line).toBe("trucking");
    expect(final.leadCompleted?.tags).toEqual([]);
    expect(Object.keys(final.leadCompleted?.answers ?? {})).toContain("firstName");
    expect(final.messages.some((m) => m.buttons?.includes("Yes, start quote"))).toBe(true);
  });
});

describe("conversation engine — escalation triggers", () => {
  it("jumps to human handoff and tags the eventual lead as Needs Human", () => {
    let result = requireHandled(transition(INITIAL_STATE, text("Florida")));
    result = requireHandled(transition(result.state, text("I had an accident")));
    expect(result.state.phase).toBe("humanHandoff");
    expect(result.state.escalated).toBe(true);

    result = requireHandled(transition(result.state, button("Fill out callback form")));
    expect(result.state.phase).toBe("leadCapture");

    const final = fillLeadCapture(result.state);
    expect(final.leadCompleted?.tags).toContain("Needs Human");
    expect(final.leadCompleted?.line).toBeUndefined();
    // No product line was ever selected, so the closing message plays instead of a line CTA.
    expect(final.state.phase).toBe("closed");
  });

  it("does not fire an escalation trigger on unrelated free text", () => {
    const result = requireHandled(transition(INITIAL_STATE, text("Oregon")));
    expect(result.state.phase).toBe("mainMenu");
  });
});

describe("conversation engine — state eligibility gate", () => {
  it("offers only DOT compliance for a real but unsupported state", () => {
    const result = requireHandled(transition(INITIAL_STATE, text("California")));
    expect(result.messages.some((m) => m.text.includes("licensed to serve"))).toBe(true);
    expect(result.messages.some((m) => m.buttons?.includes("DOT Compliance Services"))).toBe(true);

    const next = requireHandled(transition(result.state, button("DOT Compliance Services")));
    expect(next.state.selectedLine).toBe("dotCompliance");
  });

  it("reprompts on unrecognizable input without crashing", () => {
    const result = requireHandled(transition(INITIAL_STATE, text("asdfghjkl")));
    expect(result.state.phase).toBe("awaitingState");
  });

  it("reprompts with the state buttons attached, not just plain text", () => {
    const result = requireHandled(transition(INITIAL_STATE, text("asdfghjkl")));
    expect(result.messages[0]?.buttons).toEqual([
      "Oregon",
      "Washington",
      "North Carolina",
      "South Carolina",
      "Ohio",
      "Tennessee",
      "Missouri",
      "Florida",
    ]);
  });

  it("accepts a state selected via button click, not just typed text", () => {
    const result = requireHandled(transition(INITIAL_STATE, button("Florida")));
    expect(result.state.phase).toBe("mainMenu");
    expect(result.state.userState).toBe("FL");
  });
});

describe("conversation engine — claims flow reachability", () => {
  it("routes 'Report a Claim' to the claims line with the safety message shown first", () => {
    const afterState = requireHandled(transition(INITIAL_STATE, text("Missouri")));
    const result = requireHandled(transition(afterState.state, button("Report a Claim")));

    expect(result.state.selectedLine).toBe("claims");
    expect(result.messages[0]?.text).toContain("call 911 first");
    expect(result.messages[1]?.buttons).toContain("Auto");
  });
});

describe("conversation engine — main menu sub-menus", () => {
  it("expands the combined Contractor Insurance / Bonds button into a sub-menu", () => {
    const afterState = requireHandled(transition(INITIAL_STATE, text("OH")));
    const subMenu = requireHandled(transition(afterState.state, button("Contractor Insurance / Bonds")));
    expect(subMenu.messages[0]?.buttons).toEqual(["Contractor Insurance", "Bond"]);

    const routed = requireHandled(transition(subMenu.state, button("Bond")));
    expect(routed.state.selectedLine).toBe("bonds");
  });
});
