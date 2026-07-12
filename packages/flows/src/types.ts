export const ELIGIBLE_STATES = [
  "OR",
  "WA",
  "NC",
  "SC",
  "OH",
  "TN",
  "MO",
  "FL",
] as const;

export type EligibleState = (typeof ELIGIBLE_STATES)[number];

export const INSURANCE_LINES = [
  "trucking",
  "commercialAuto",
  "generalLiability",
  "contractor",
  "bonds",
  "personalAuto",
  "home",
  "renters",
  "landlord",
  "umbrella",
  "claims",
  "dotCompliance",
] as const;

export type InsuranceLine = (typeof INSURANCE_LINES)[number];

/** A single scripted Q&A pair, answered verbatim (or near-verbatim) rather than freely generated. */
export interface FaqEntry {
  readonly id: string;
  readonly question: string;
  readonly answer: string;
}

/** One qualification question in a line's intake flow. */
export interface QualificationQuestion {
  readonly id: string;
  readonly prompt: string;
  readonly options?: readonly string[];
}

export interface EntryStep {
  readonly prompt: string;
  readonly buttons?: readonly string[];
}

export interface CtaStep {
  readonly prompt: string;
  readonly buttons: readonly string[];
}

/** Full conversation definition for one insurance product line. */
export interface FlowDefinition {
  readonly line: InsuranceLine;
  readonly label: string;
  readonly entry: EntryStep;
  readonly qualificationQuestions: readonly QualificationQuestion[];
  readonly faqs: readonly FaqEntry[];
  readonly cta: CtaStep;
  readonly crossSell?: string;
}

export interface UniversalLeadField {
  readonly id: string;
  readonly label: string;
  readonly required: boolean;
}
