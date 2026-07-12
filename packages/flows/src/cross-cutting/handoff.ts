import { BUSINESS_INFO } from "../business-info.js";

/** Source: docx §15 + n8n diagram's "Talk to a person" screen — shown immediately, before the async form. */
export const HUMAN_HANDOFF_INTRO = `We'd be happy to connect you with a licensed insurance agent.\nCall us: ${BUSINESS_INFO.phone}\nBusiness Hours: ${BUSINESS_INFO.businessHours}`;

/** Source: docx §16 "Quote Closing Flow". */
export const QUOTE_CLOSING_PROMPT =
  "Based on what you selected, the next step is to have a licensed agent review your information and compare available options.";

export const QUOTE_CLOSING_BUTTONS = [
  "Start quote now",
  "Upload current policy",
  "Request call",
  "Request text",
  "Ask another question",
] as const;
