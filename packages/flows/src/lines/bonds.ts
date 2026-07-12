import type { FlowDefinition } from "../types.js";

/** Source: docx §6 "Bonds Script Tree". */
export const bondsFlow: FlowDefinition = {
  line: "bonds",
  label: "Bonds",
  entry: {
    prompt: "We can help with many types of bonds. What kind of bond do you need?",
    buttons: [
      "Contractor bond",
      "License/permit bond",
      "Notary bond",
      "Court bond",
      "Performance bond",
      "Payment bond",
      "Not sure",
    ],
  },
  qualificationQuestions: [
    { id: "bondTypeRequired", prompt: "What type of bond is required?" },
    { id: "whoRequiresBond", prompt: "Who is requiring the bond?" },
    { id: "bondAmount", prompt: "What bond amount do you need?" },
    { id: "businessName", prompt: "What is your business name?" },
    { id: "ownerName", prompt: "What is the owner's name?" },
    { id: "state", prompt: "What state is this for?" },
    { id: "deadline", prompt: "Is there a deadline?" },
    { id: "hasBondForm", prompt: "Do you have the bond form?", options: ["Yes", "No"] },
  ],
  faqs: [
    {
      id: "what-is-a-bond",
      question: "What is a bond?",
      answer:
        "A bond is not the same as insurance. It is usually a guarantee required by a government office, project owner, or contract. If you have the bond form, we can review what is required.",
    },
    {
      id: "surety-bond-do-i-need-one",
      question: "What is a surety bond and do I need one?",
      answer:
        "A surety bond is a three-party agreement that guarantees you'll fulfill your obligations — it's essentially a promise backed by an insurance company. Many construction contractors, freight brokers, and businesses that work with government contracts are required to have one. If you're not sure whether you need one, let one of our agents take a quick look at your situation. Want me to set that up?",
    },
    {
      id: "how-fast-can-i-get-a-bond",
      question: "How fast can I get a bond?",
      answer:
        "Some simple license or permit bonds can be issued quickly. Larger contractor, performance, or payment bonds may require more review and financial information.",
    },
    {
      id: "why-do-they-need-my-credit",
      question: "Why do they need my credit for a bond?",
      answer:
        "Some bonds require credit review because the bond company is guaranteeing your obligation. The requirements depend on the bond type and amount.",
    },
  ],
  cta: {
    prompt: "Would you like a licensed agent to help with your bond?",
    buttons: ["Yes, start quote", "I want to upload my bond form", "Call me", "Text me", "I'm just comparing"],
  },
};
