import type { FlowDefinition } from "../types.js";

/** Source: docx §4 "Business Insurance / General Liability Script Tree". */
export const generalLiabilityFlow: FlowDefinition = {
  line: "generalLiability",
  label: "Business / General Liability",
  entry: {
    prompt:
      "General liability helps protect a business if someone claims injury, property damage, or certain business-related harm. What type of business do you have?",
    buttons: [
      "Contractor",
      "Cleaning business",
      "Restaurant / food",
      "Retail store",
      "Office / professional service",
      "Landscaping",
      "Transportation",
      "Other",
    ],
  },
  qualificationQuestions: [
    { id: "businessName", prompt: "What is your business name?" },
    { id: "typeOfWork", prompt: "What type of work do you do?" },
    { id: "yearsInBusiness", prompt: "How many years in business?" },
    { id: "annualRevenue", prompt: "What is your annual revenue?" },
    { id: "employeeCount", prompt: "How many employees?" },
    { id: "hasSubcontractors", prompt: "Any subcontractors?", options: ["Yes", "No"] },
    { id: "priorClaims", prompt: "Any prior claims?", options: ["Yes", "No"] },
    { id: "needsCertificate", prompt: "Do you need a certificate of insurance?", options: ["Yes", "No"] },
    { id: "needsAdditionalInsured", prompt: "Do you need additional insured?", options: ["Yes", "No"] },
    { id: "desiredEffectiveDate", prompt: "Desired effective date?" },
  ],
  faqs: [
    {
      id: "what-is-gl",
      question: "What is general liability insurance?",
      answer:
        "General liability helps protect your business if someone claims bodily injury, property damage, or certain types of business-related liability. For example, if a customer is hurt at your location or you damage someone's property while working.",
    },
    {
      id: "gl-if-work-alone",
      question: "Do I need GL if I work alone?",
      answer:
        "Usually yes, especially if clients, landlords, or contractors require proof of insurance. Even small businesses can face expensive claims.",
    },
    {
      id: "certificate-today",
      question: "Can I get a certificate of insurance today?",
      answer:
        "Possibly. If your policy is active and all information is complete, certificates can often be issued quickly. If you need special wording, an agent will need to review it.",
    },
    {
      id: "what-is-additional-insured",
      question: 'What does "additional insured" mean?',
      answer:
        "It means another person or company is added to your policy for certain protection related to your work. This is common when a landlord, contractor, or project owner requires it.",
    },
    {
      id: "gl-vs-workers-comp",
      question: "Is general liability the same as workers comp?",
      answer:
        "No. General liability usually protects against injury or damage claims from others. Workers compensation is for employee work-related injuries. They are different policies.",
    },
    {
      id: "does-trucking-policy-include-gl",
      question: "Does my trucking policy include general liability?",
      answer:
        "Your trucking or commercial auto policy covers you while you're on the road, but it doesn't necessarily cover incidents that happen off the road — like at your yard, your office, or while doing business activities that aren't driving-related. That's where a separate GL policy comes in. A lot of shippers and brokers are also starting to require GL in addition to your trucking liability. Want us to take a look at your full coverage picture?",
    },
  ],
  cta: {
    prompt: "Would you like a licensed agent to review your general liability options?",
    buttons: ["Yes, start quote", "I want to upload my current policy", "Call me", "Text me", "I'm just comparing"],
  },
};
