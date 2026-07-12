import type { FlowDefinition } from "../types.js";

/** Source: docx §10 "Landlord Insurance Script Tree". */
export const landlordFlow: FlowDefinition = {
  line: "landlord",
  label: "Landlord Insurance",
  entry: {
    prompt:
      "Landlord insurance is for property you own and rent to others. Is the property rented long-term, short-term, or vacant?",
    buttons: [
      "Long-term rental",
      "Short-term rental / Airbnb",
      "Vacant property",
      "Duplex / multi-family",
      "Not sure",
    ],
  },
  qualificationQuestions: [
    { id: "propertyAddress", prompt: "What is the property address?" },
    { id: "unitCount", prompt: "How many units?" },
    {
      id: "rentalTerm",
      prompt: "Long-term or short-term rental?",
      options: ["Long-term", "Short-term"],
    },
    { id: "occupancyStatus", prompt: "What is the occupancy status?" },
    { id: "claimsHistory", prompt: "Any claims history?" },
    { id: "roofAge", prompt: "How old is the roof?" },
    { id: "desiredLiabilityLimit", prompt: "Desired liability limit?" },
    {
      id: "needsLossOfRentCoverage",
      prompt: "Need loss of rent coverage?",
      options: ["Yes", "No"],
    },
  ],
  faqs: [
    {
      id: "homeowners-for-rental",
      question: "Can I use regular homeowners insurance for a rental?",
      answer:
        "Usually no. If the home is rented to others, you typically need a landlord policy. A regular homeowners policy may not properly cover rental exposure.",
    },
    {
      id: "landlord-covers-tenant-belongings",
      question: "Does landlord insurance cover tenant belongings?",
      answer:
        "Usually no. Tenants need their own renters insurance for their belongings and liability.",
    },
  ],
  cta: {
    prompt: "Would you like a licensed agent to review your landlord insurance options?",
    buttons: ["Yes, start quote", "I want to upload my current policy", "Call me", "Text me", "I'm just comparing"],
  },
  crossSell:
    "A lot of landlords also add an umbrella policy for extra liability protection above their landlord policy limits. Want us to price that out alongside your quote?",
};
