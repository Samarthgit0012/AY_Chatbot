import { describe, expect, it } from "vitest";
import { FLOWS_BY_LINE, INSURANCE_LINES } from "../index.js";

describe("FLOWS_BY_LINE", () => {
  it("has a definition for every declared insurance line", () => {
    for (const line of INSURANCE_LINES) {
      expect(FLOWS_BY_LINE[line]).toBeDefined();
      expect(FLOWS_BY_LINE[line].line).toBe(line);
    }
  });

  it("every flow has a non-empty entry prompt and CTA", () => {
    for (const line of INSURANCE_LINES) {
      const flow = FLOWS_BY_LINE[line];
      expect(flow.entry.prompt.length).toBeGreaterThan(0);
      expect(flow.cta.prompt.length).toBeGreaterThan(0);
      expect(flow.cta.buttons.length).toBeGreaterThan(0);
    }
  });

  it("every FAQ has both a question and an answer", () => {
    for (const line of INSURANCE_LINES) {
      for (const faq of FLOWS_BY_LINE[line].faqs) {
        expect(faq.question.length).toBeGreaterThan(0);
        expect(faq.answer.length).toBeGreaterThan(0);
      }
    }
  });

  it("FAQ ids are unique within each flow", () => {
    for (const line of INSURANCE_LINES) {
      const ids = FLOWS_BY_LINE[line].faqs.map((f) => f.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });
});
