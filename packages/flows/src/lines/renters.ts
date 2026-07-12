import type { FlowDefinition } from "../types.js";

/** Source: docx §9 "Renters Insurance Script Tree". */
export const rentersFlow: FlowDefinition = {
  line: "renters",
  label: "Renters Insurance",
  entry: {
    prompt:
      "Renters insurance is usually affordable and helps protect your personal belongings and liability. Are you getting it for an apartment, house, or landlord requirement?",
    buttons: ["Apartment", "House", "Landlord requirement"],
  },
  qualificationQuestions: [
    { id: "propertyAddress", prompt: "What is the property address?" },
    { id: "desiredCoverageAmount", prompt: "How much personal property coverage would you like?" },
    { id: "desiredEffectiveDate", prompt: "Desired effective date?" },
  ],
  faqs: [
    {
      id: "what-does-renters-cover",
      question: "What does renters insurance cover?",
      answer:
        "It can cover your personal belongings, liability, and sometimes temporary living expenses after a covered loss. Exact coverage depends on the policy.",
    },
    {
      id: "landlord-already-has-insurance",
      question: "My landlord has insurance. Why do I need renters insurance?",
      answer:
        "The landlord's policy usually covers the building, not your personal belongings or your personal liability.",
    },
    {
      id: "is-renters-expensive",
      question: "Is renters insurance expensive?",
      answer:
        "Usually it is one of the more affordable policies. The cost depends on coverage amount, location, and options selected.",
    },
  ],
  cta: {
    prompt: "Would you like a licensed agent to put together a renters insurance quote?",
    buttons: ["Yes, start quote", "Call me", "Text me", "I'm just comparing"],
  },
};
