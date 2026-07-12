/** Source: docx §15 "Human Escalation Triggers" — matched against free-text user input in any state. */
export const ESCALATION_TRIGGER_PHRASES = [
  "i want to bind",
  "i want to cancel",
  "i had an accident",
  "i need proof of insurance now",
  "dmv problem",
  "lawsuit",
  "claim denied",
  "certificate needed today",
  "my truck is at the dealer",
  "police pulled me over",
  "i'm angry",
  "im angry",
] as const;

export const ESCALATION_RESPONSE =
  "This needs a licensed agent. I can send your information now so someone can help you directly.";

/** Source: docx §12 rude/aggressive-client handling — escalating tiers of firmness. */
export const RUDE_CLIENT_RESPONSES = {
  mildFrustration:
    "I understand. A lot of people are frustrated with insurance costs right now. I can help review what affects the price and see if there may be a better option.",
  accusationOfScam:
    "I understand why it may feel that way when the price is higher than expected. Insurance pricing depends on many factors, including risk, claims, coverage limits, and carrier rules. If you'd like, we can break it down clearly.",
  rudeLanguage:
    "I'm here to help. If something does not look right, we can review it step by step and make sure your information is accurate.",
  empathetic:
    "I'm sorry you're feeling this way — it sounds like something really frustrated you, and I'd genuinely like to help fix it. I'm not able to resolve everything through chat, but I can get a real person on the phone with you fast. Can I get your name and number so we can call you back and make this right?",
  respectRequest:
    "I want to help you, and I'm going to keep trying to do that. But I do need us to keep things respectful so we can actually get somewhere. If you'd like to speak with someone directly, please call us at 980-474-9342 during business hours (9AM–6PM EST), or email us at info@revasins.com. We truly want to resolve this for you.",
  repeatedHostility:
    "I want to help, but we need to keep the conversation respectful. If you still need assistance, I can connect you with a licensed agent.",
  sessionEnd:
    "I understand you're upset, and I'm sorry we haven't met your expectations. Unfortunately I'm not able to continue this conversation in its current direction, but our team is ready and willing to help you professionally. Please reach out to us at 980-474-9342 or info@revasins.com whenever you're ready. We're here for you.",
  threateningLegalAction:
    "I understand this is serious. For legal concerns or formal disputes, it is best to speak directly with the agency owner or a licensed agent. I can collect your contact information so someone can follow up.",
  discriminationComplaint:
    "No. Insurance pricing must follow carrier underwriting rules and applicable insurance laws. Rates are based on factors such as coverage, location, driving record, claims history, vehicle/property type, business operations, and other approved rating factors. A licensed agent can review your quote and explain what affected the price.",
} as const;

/** Source: docx §17 after-hours flow. */
export const AFTER_HOURS_GREETING =
  "Hey! Thanks for reaching out to Revas Insurance. Our team is currently out of the office, but I don't want you to leave empty-handed! If you leave me your name, phone number, email, and a good time to reach you, one of our agents will get back to you first thing. We're open Monday–Friday, 9AM–6PM EST. What's the best way to reach you?";

export const AFTER_HOURS_CONFIRMATION =
  "Perfect! I've got your info and I'll make sure our team reaches out to you. In the meantime, you can also email us directly at info@revasins.com or call 980-474-9342 during business hours. Thanks for choosing Revas Insurance — talk soon!";

/** Source: docx §13 "Provocative / Difficult Questions" — cross-cutting FAQ, not tied to one line. */
export const PROVOCATIVE_QUESTION_FAQS = [
  {
    id: "cheapest-insurance",
    question: "Can you just give me the cheapest insurance?",
    answer:
      "We can look for affordable options, but the cheapest policy is not always the safest choice. The goal is to avoid overpaying while still protecting you properly.",
  },
  {
    id: "remove-drivers",
    question: "Can you remove drivers so my price goes down?",
    answer:
      "A licensed agent must review household and driver information accurately. We cannot remove required drivers just to lower the price if they should be listed.",
  },
  {
    id: "misrepresent-vehicle-use",
    question: "Can I say my truck is personal even if I use it for business?",
    answer:
      "It is important to describe the vehicle use accurately. If a claim happens and the use was misrepresented, coverage can become a serious problem. We can help find the right policy for the actual use.",
  },
  {
    id: "backdate-insurance",
    question: "Can you backdate my insurance?",
    answer:
      "No. Insurance cannot be backdated. We can help you start coverage as soon as possible if you qualify.",
  },
  {
    id: "bind-through-chatbot",
    question: "Can you bind coverage right now through the chatbot?",
    answer:
      "The chatbot can collect information and help start the process, but coverage is not active until confirmed by a licensed agent or carrier and any required payment or documents are completed.",
  },
  {
    id: "cancel-old-policy",
    question: "Can I cancel my old policy now?",
    answer:
      "Please do not cancel your current policy until your new coverage is confirmed active. A gap in coverage can create problems.",
  },
  {
    id: "guarantee-claim-paid",
    question: "Can you guarantee my claim will be paid?",
    answer:
      "No one can guarantee a claim outcome before the insurance company reviews the policy, facts, and documentation. We can help explain the process and connect you with the right contact.",
  },
] as const;

/** Source: docx §11 general FAQ. */
export const GENERAL_FAQS = [
  {
    id: "are-you-real",
    question: "Are you a real person?",
    answer:
      "Ha — good question! I'm Riva, Revas Insurance's virtual assistant. I'm not a human, but I'm pretty good at answering questions and making sure a real person from our team follows up with you when it counts. Is there anything I can help you with today?",
  },
  {
    id: "make-a-payment",
    question: "Can I make a payment through here?",
    answer:
      "Payments are processed directly through your insurance carrier's website or payment portal. If you're having trouble finding that information, our team can help point you the right way — just call us at 980-474-9342 or shoot an email to info@revasins.com!",
  },
  {
    id: "which-carriers",
    question: "What carriers do you work with?",
    answer:
      "We work with a wide range of top-rated carriers so we can shop the market and find you the best deal. Some of our carriers include Progressive, Great West, Canal Insurance, BHHC, Geico, NICO, Northland, Allstate, National General, and many more. Having access to multiple carriers means we're not locked into one option — we find what works best for you.",
  },
] as const;
