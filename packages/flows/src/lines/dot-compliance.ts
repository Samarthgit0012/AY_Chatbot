import type { FlowDefinition } from "../types.js";

/**
 * Source: docx "SECTION 7: DOT Compliance Services".
 * Unlike every other line, this one bypasses the state-eligibility gate —
 * DOT compliance services are offered nationwide.
 */
export const dotComplianceFlow: FlowDefinition = {
  line: "dotCompliance",
  label: "DOT Compliance Services",
  entry: {
    prompt:
      "We offer a full range of DOT compliance services to keep your operation running legally and smoothly. Here's what we can help you with: Business registration in any state, MC/DOT registration, IRP Registration (new and renewals), IFTA filing, IRP/IFTA Audits, DOT New Entrant Safety Audit support, DOT Number Deactivation (Out of Service) and Reactivation, Designation of Process Agents (BOC-3), Unified Carrier Registration (UCR), State permits (Connecticut, Oregon, Kentucky Weight Distance, New Mexico Weight Distance Tax, New York Highway Use Tax), Form 2290 (Heavy Vehicle Use Tax). What do you need help with?",
    buttons: [
      "Business/MC/DOT registration",
      "IRP registration",
      "IFTA filing",
      "DOT number deactivated / reactivation",
      "BOC-3",
      "UCR",
      "State permits",
      "Form 2290",
    ],
  },
  qualificationQuestions: [
    { id: "businessName", prompt: "What is your business/carrier name?" },
    { id: "usdotNumber", prompt: "What is your USDOT number, if you have one?" },
    { id: "serviceNeeded", prompt: "Which service(s) do you need?" },
    { id: "deadline", prompt: "Is there a deadline we should know about?" },
  ],
  faqs: [
    {
      id: "what-is-irp",
      question: "What is IRP registration?",
      answer:
        "IRP stands for International Registration Plan — it's the program that allows commercial trucks traveling through multiple states (or Canadian provinces) to be registered under one plate and one set of fees. Instead of buying a separate permit for every state you drive through, IRP calculates your fees based on the miles you drive in each state. If you're an interstate trucker, you almost certainly need this. Want us to help you get set up or renew?",
    },
    {
      id: "what-is-ifta",
      question: "What is IFTA?",
      answer:
        "IFTA stands for International Fuel Tax Agreement. It simplifies fuel tax reporting for truckers who operate in multiple states. Instead of filing fuel taxes in every state you drive through, you file one quarterly report that covers everything. If you drive across state lines for work, you're required to have an IFTA license. We handle the filing process for you. Want to get started?",
    },
    {
      id: "what-is-form-2290",
      question: "What is Form 2290?",
      answer:
        "Form 2290 is the IRS Heavy Vehicle Use Tax (HVUT) form — it's required for any truck with a gross weight of 55,000 pounds or more that operates on public highways. You file it annually, and you need the stamped Schedule 1 as proof of payment for your IRP registration. We can file this for you. Want help getting it done?",
    },
    {
      id: "what-is-boc-3",
      question: "What is a BOC-3?",
      answer:
        "A BOC-3 is the Designation of Process Agents form required by the FMCSA. It designates a legal representative in each state where you operate who can accept legal papers on your behalf. It's required before the FMCSA will issue your operating authority (MC number). It's a quick filing — we can take care of it for you. Want us to handle it?",
    },
    {
      id: "dot-number-deactivated",
      question: "My DOT number was deactivated / I got put Out of Service. What do I do?",
      answer:
        "Don't panic — this is fixable. A DOT number can be deactivated for a few different reasons, including failing a New Entrant Safety Audit or non-compliance issues. We can help you understand why it happened and walk you through the reactivation process step by step. The sooner you act, the better. Want me to connect you with someone from our compliance team right away?",
    },
    {
      id: "what-is-ucr",
      question: "What is UCR (Unified Carrier Registration)?",
      answer:
        "UCR is an annual federal registration that's required for motor carriers, freight brokers, leasing companies, and freight forwarders operating in interstate commerce. The fee is based on the size of your fleet. It's one of those things that's easy to forget about but can cause compliance headaches if it lapses. We make sure you stay on top of it. Want us to handle your UCR registration?",
    },
    {
      id: "new-york-hut",
      question: "Do I need a New York Highway Use Tax permit?",
      answer:
        "If you operate a truck with a gross weight over 18,000 lbs on New York State public highways, yes — you're required to register for the New York Highway Use Tax (HUT). We handle this filing for our clients. Want us to take care of it for you?",
    },
  ],
  cta: {
    prompt: "Would you like a licensed compliance specialist to help with this filing?",
    buttons: ["Yes, get started", "Call me", "Text me", "I'm just asking"],
  },
};
