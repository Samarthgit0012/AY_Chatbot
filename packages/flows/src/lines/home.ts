import type { FlowDefinition } from "../types.js";

/** Source: docx §8 "Home Insurance Script Tree". */
export const homeFlow: FlowDefinition = {
  line: "home",
  label: "Home Insurance",
  entry: {
    prompt:
      "Are you looking for homeowners insurance for a home you own, a new purchase, or to compare your current policy?",
    buttons: [
      "New home purchase",
      "Current homeowner",
      "Compare policy",
      "Rental property",
      "Condo",
      "Question only",
    ],
  },
  qualificationQuestions: [
    { id: "propertyAddress", prompt: "What is the property address?" },
    { id: "yearBuilt", prompt: "What year was it built?" },
    { id: "squareFootage", prompt: "What is the square footage?" },
    { id: "roofAge", prompt: "How old is the roof?" },
    {
      id: "systemUpdates",
      prompt: "Any heating/plumbing/electrical updates?",
    },
    { id: "priorClaims", prompt: "Any prior claims?", options: ["Yes", "No"] },
    { id: "mortgageCompany", prompt: "Who is the mortgage company?" },
    { id: "desiredEffectiveDate", prompt: "Desired effective date?" },
    { id: "hasCurrentPolicy", prompt: "Do you have a current policy?", options: ["Yes", "No"] },
  ],
  faqs: [
    {
      id: "why-did-home-insurance-go-up",
      question: "Why did my home insurance go up?",
      answer:
        "Home insurance can increase because of repair costs, weather losses, roof age, claim trends, inflation, and carrier rate changes. We can review whether your coverage is still competitive.",
    },
    {
      id: "what-does-homeowners-cover",
      question: "What does homeowners insurance cover?",
      answer:
        "A standard homeowners policy typically covers: Your home's structure — if it's damaged by fire, storms, etc. Your personal belongings — furniture, electronics, clothing, etc. Liability protection — if someone gets hurt on your property. Additional living expenses — if you have to temporarily live elsewhere while your home is repaired. There are also optional add-ons for things like flood, earthquake, or high-value items. Want to talk to someone about putting the right policy together?",
    },
    {
      id: "does-home-cover-flood",
      question: "Does home insurance cover flood?",
      answer:
        "Most standard homeowners policies do not cover flood damage. Flood insurance is usually separate. A licensed agent can help check your risk and options.",
    },
    {
      id: "does-home-cover-roof-damage",
      question: "Does home insurance cover roof damage?",
      answer:
        "It depends on the cause of damage, roof age, policy type, deductible, and exclusions. Wind or hail may be handled differently than wear and tear.",
    },
    {
      id: "bundle-home-and-auto",
      question: "Do I need to bundle home and auto?",
      answer:
        "You do not have to, but bundling often gives discounts and makes policies easier to manage.",
    },
  ],
  cta: {
    prompt: "Would you like a licensed agent to review your home insurance options?",
    buttons: ["Yes, start quote", "I want to upload my current policy", "Call me", "Text me", "I'm just comparing"],
  },
};
