import type { UniversalLeadField } from "./types.js";

/** Source: docx §1 "Universal Lead Capture Flow" — required on every product line's form step. */
export const UNIVERSAL_LEAD_FIELDS: readonly UniversalLeadField[] = [
  { id: "firstName", label: "First name", required: true },
  { id: "lastName", label: "Last name", required: true },
  { id: "phone", label: "Phone number", required: true },
  { id: "email", label: "Email", required: true },
  { id: "state", label: "State", required: true },
  { id: "insuranceType", label: "Type of insurance needed", required: true },
  { id: "bestTimeToContact", label: "Best time to contact", required: true },
  {
    id: "preferredContactMethod",
    label: "Preferred contact method",
    required: true,
  },
] as const;

export const LEAD_CAPTURE_INTRO =
  "I can help with that. To point you in the right direction, may I ask a few quick questions?";

export const LEAD_CAPTURE_HESITANT_RESPONSE =
  "No problem. I only need basic information so a licensed agent can review options and avoid guessing.";

export const LEAD_CAPTURE_CONFIRMATION =
  "Thank you. A licensed agent can review this and help you compare options. Would you like to start the quote questions now?";

export const FINAL_SUBMISSION_MESSAGE =
  "Thank you. Your information was received. A licensed agent will review it and contact you by your preferred method.";

/** Source: docx §21 "Developer Notes" — CRM tags, repurposed as lead-record tags/columns since there is no CRM. */
export const LEAD_TAGS = [
  "Lead - Trucking",
  "Lead - Contractor",
  "Lead - Personal Auto",
  "Lead - Home",
  "Lead - Landlord",
  "Lead - Bond",
  "Urgent",
  "Needs Human",
  "Uploaded Policy",
  "Certificate Request",
  "After Hours",
] as const;

export type LeadTag = (typeof LEAD_TAGS)[number];
