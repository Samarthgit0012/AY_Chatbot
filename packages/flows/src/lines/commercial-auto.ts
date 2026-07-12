import type { FlowDefinition } from "../types.js";

/** Source: docx "Commercial Auto Script Tree" (§3). */
export const commercialAutoFlow: FlowDefinition = {
  line: "commercialAuto",
  label: "Commercial Auto",
  entry: {
    prompt: "Commercial auto is for vehicles used for business. What type of vehicle do you need covered?",
    buttons: [
      "Pickup truck",
      "Van",
      "Box truck",
      "Car used for business",
      "Contractor vehicle",
      "Delivery vehicle",
      "Fleet",
      "Other",
    ],
  },
  qualificationQuestions: [
    { id: "businessName", prompt: "What is your business name?" },
    { id: "vehicleDetails", prompt: "Vehicle year/make/model/VIN?" },
    { id: "vehicleUse", prompt: "How is the vehicle used?" },
    { id: "vehicleCount", prompt: "How many vehicles?" },
    { id: "driverCount", prompt: "How many drivers?" },
    { id: "claimsOrViolations", prompt: "Any claims or violations?" },
    { id: "desiredStartDate", prompt: "Desired start date?" },
    { id: "hasCurrentInsurance", prompt: "Do you have current insurance?", options: ["Yes", "No"] },
  ],
  faqs: [
    {
      id: "personal-auto-for-business",
      question: "Can I use personal auto insurance for business?",
      answer:
        "Sometimes personal auto may not cover business use properly. If the vehicle is used for work, deliveries, employees, job sites, or business errands, commercial auto may be needed. A licensed agent should review the exact use.",
    },
    {
      id: "commercial-auto-more-expensive",
      question: "Is commercial auto more expensive?",
      answer:
        "Often yes, because business vehicles may be driven more, carry tools or cargo, visit job sites, or have higher liability exposure. But pricing depends on the vehicle, drivers, use, and coverage limits.",
    },
    {
      id: "insure-multiple-vehicles",
      question: "Can you insure multiple vehicles?",
      answer:
        "Yes. We can help with one vehicle or a fleet. The more details we have, the better we can compare options.",
    },
  ],
  cta: {
    prompt: "Would you like a licensed agent to review your commercial auto options?",
    buttons: ["Yes, start quote", "I want to upload my current policy", "Call me", "Text me", "I'm just comparing"],
  },
};
