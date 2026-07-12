import type { FlowDefinition } from "../types.js";

/** Source: docx §7 "Personal Auto Script Tree". */
export const personalAutoFlow: FlowDefinition = {
  line: "personalAuto",
  label: "Personal Auto",
  entry: {
    prompt:
      "We can help compare personal auto insurance options. Are you looking for a new policy or checking if you can save money?",
    buttons: [
      "New policy",
      "Compare current policy",
      "Add vehicle",
      "Add driver",
      "Need SR-22 / FS-1 / DMV issue",
      "Question only",
    ],
  },
  qualificationQuestions: [
    { id: "name", prompt: "What is your name?" },
    { id: "address", prompt: "What is your address?" },
    { id: "dateOfBirth", prompt: "What is your date of birth?" },
    { id: "vehicleDetails", prompt: "Vehicle year/make/model/VIN?" },
    { id: "householdDrivers", prompt: "Who are the drivers in the household?" },
    { id: "accidentsTicketsClaims", prompt: "Any accidents, tickets, or claims?" },
    { id: "currentInsurance", prompt: "Do you have current insurance?" },
    { id: "desiredCoverage", prompt: "What coverage are you looking for?" },
    {
      id: "needsSameDayCoverage",
      prompt: "Do you need same-day coverage?",
      options: ["Yes", "No"],
    },
  ],
  faqs: [
    {
      id: "what-does-personal-auto-cover",
      question: "What does personal auto insurance cover?",
      answer:
        "A standard personal auto policy typically includes: Liability — Pays for damage or injuries you cause to others. Collision — Covers your car if you're in an accident. Comprehensive — Covers theft, weather, fire, vandalism, and more. Uninsured/Underinsured Motorist — Protects you if the other driver doesn't have enough coverage. Medical Payments / PIP — Helps with medical costs after an accident. You can mix and match these based on your needs and budget. Want help figuring out the right combo for you?",
    },
    {
      id: "can-i-bundle-auto-and-home",
      question: "Can I bundle my auto and home insurance?",
      answer:
        "Yes — and you should! Bundling your auto and home (or renters) insurance with us is one of the easiest ways to save money. Most clients save a noticeable amount just by keeping both policies in one place. Plus, it's easier to manage. Want me to have someone put together a bundled quote for you?",
    },
    {
      id: "why-did-auto-insurance-go-up",
      question: "Why did my auto insurance go up?",
      answer:
        "Auto rates can increase because of repair costs, claims trends, driving history, location, vehicle type, and carrier rate changes. It may not be only because of something you personally did. We can review options.",
    },
    {
      id: "what-is-liability-coverage",
      question: "What is liability coverage?",
      answer:
        "Liability helps pay for injury or damage you cause to others in an accident, up to your policy limits. North Carolina provides consumer information on auto coverage through the Department of Insurance.",
    },
    {
      id: "what-is-full-coverage",
      question: "What is full coverage?",
      answer:
        '"Full coverage" usually means liability plus comprehensive and collision. It is not a legal policy term, and it does not mean everything is covered. An agent should review your policy limits and deductibles.',
    },
    {
      id: "what-deductible-should-i-choose",
      question: "What deductible should I choose?",
      answer:
        "A higher deductible can lower premium, but you pay more out of pocket if you have a claim. A lower deductible costs more but may be easier during an accident.",
    },
    {
      id: "bad-driving-record",
      question: "Can I get insurance with a bad driving record?",
      answer:
        "Usually yes, but options and pricing may be different. We can check available carriers based on your driving history.",
    },
  ],
  cta: {
    prompt: "Would you like a licensed agent to review your personal auto options?",
    buttons: ["Yes, start quote", "I want to upload my current policy", "Call me", "Text me", "I'm just comparing"],
  },
  crossSell:
    "While we're at it — do you own a home or rent? A lot of our clients save money by bundling their auto with a home or renters policy. Want me to have someone put together a combined quote for you?",
};
