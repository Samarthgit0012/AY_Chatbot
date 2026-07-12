import type { FlowDefinition } from "../types.js";

/** Source: docx §14 "Claims Script Tree". */
export const claimsFlow: FlowDefinition = {
  line: "claims",
  label: "Claims",
  entry: {
    prompt: "I'm sorry you're dealing with a claim. Is this for auto, home, business, or trucking?",
    buttons: ["Auto", "Home", "Business", "Trucking", "I need claim contact info"],
  },
  qualificationQuestions: [
    { id: "policyholderName", prompt: "What is the policyholder's name?" },
    { id: "policyNumber", prompt: "Do you have a policy number available?" },
    { id: "dateTimeOfLoss", prompt: "What was the date/time of loss?" },
    { id: "location", prompt: "Where did this happen?" },
    { id: "whatHappened", prompt: "What happened?" },
    { id: "hasPhotosOrDocuments", prompt: "Do you have photos/documents available?", options: ["Yes", "No"] },
    { id: "bestContactNumber", prompt: "What is the best contact number?" },
  ],
  faqs: [],
  cta: {
    prompt:
      "I can help you start the process, but the insurance company determines coverage based on the policy and claim facts.",
    buttons: ["Submit claim details", "Call me", "Text me"],
  },
};

/** Source: docx §14.2 — shown before any info collection, on every claims-flow entry. */
export const CLAIMS_SAFETY_RESPONSE =
  "If anyone is injured or there is immediate danger, please call 911 first. If everyone is safe, I can help collect basic information and connect you with the right claims contact.";

/** Source: docx §14.4. */
export const CLAIMS_DISCLAIMER =
  "I can help you start the process, but the insurance company determines coverage based on the policy and claim facts.";
