import type { FlowDefinition } from "../types.js";

/** Source: docx §11 "Umbrella Insurance Script Tree". */
export const umbrellaFlow: FlowDefinition = {
  line: "umbrella",
  label: "Umbrella Insurance",
  entry: {
    prompt:
      "Umbrella insurance gives extra liability protection above your auto, home, landlord, or business policies. Is this for personal or business protection?",
    buttons: ["Personal umbrella", "Commercial umbrella", "Not sure"],
  },
  qualificationQuestions: [
    { id: "underlyingPolicies", prompt: "What underlying policies do you currently have with us or elsewhere?" },
    { id: "desiredUmbrellaLimit", prompt: "What umbrella limit are you looking for?" },
  ],
  faqs: [
    {
      id: "what-is-a-commercial-umbrella",
      question: "What is a commercial umbrella policy?",
      answer:
        "A commercial umbrella policy gives your business an extra layer of protection on top of your existing liability policies. So if a claim exceeds the limits of your GL or auto policy, your umbrella kicks in to cover the rest. It's a cost-effective way to get much higher protection limits. Want to discuss whether it makes sense for your business?",
    },
    {
      id: "what-is-umbrella-insurance",
      question: "What is umbrella insurance?",
      answer:
        "Umbrella insurance adds extra liability limits above your underlying policies. It can be helpful if a serious claim exceeds your regular policy limits.",
    },
    {
      id: "who-should-consider-umbrella",
      question: "Who should consider umbrella insurance?",
      answer:
        "People or businesses with assets, rental properties, vehicles, employees, higher liability exposure, or contracts requiring higher limits should consider it.",
    },
    {
      id: "is-umbrella-expensive",
      question: "Is umbrella insurance expensive?",
      answer:
        "It is often affordable compared with the amount of extra protection it provides, but pricing depends on your risk and underlying policies.",
    },
  ],
  cta: {
    prompt: "Would you like a licensed agent to review umbrella options for you?",
    buttons: ["Yes, start quote", "Call me", "Text me", "I'm just comparing"],
  },
};
