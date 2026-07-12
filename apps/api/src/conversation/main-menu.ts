import type { InsuranceLine } from "@revas/flows";

/**
 * The docx main menu (§0) has two combined buttons ("Contractor Insurance /
 * Bonds" and "Home / Renters / Landlord") that fan out to more than one
 * flow. Selecting a combo button shows a short sub-menu; the sub-menu's own
 * buttons resolve directly to a line, without needing a dedicated phase.
 */
export interface SubMenuRoute {
  readonly kind: "subMenu";
  readonly prompt: string;
  readonly buttons: readonly string[];
}

export interface LineRoute {
  readonly kind: "line";
  readonly line: InsuranceLine;
}

export interface QuestionRoute {
  readonly kind: "question";
}

export interface HumanHandoffRoute {
  readonly kind: "humanHandoff";
}

export type MainMenuRoute = SubMenuRoute | LineRoute | QuestionRoute | HumanHandoffRoute;

export const MAIN_MENU_ROUTES: Readonly<Record<string, MainMenuRoute>> = {
  "Commercial Trucking": { kind: "line", line: "trucking" },
  "Commercial Auto": { kind: "line", line: "commercialAuto" },
  "Business / General Liability": { kind: "line", line: "generalLiability" },
  "Contractor Insurance / Bonds": {
    kind: "subMenu",
    prompt: "Are you looking for contractor insurance (general liability, tools, etc.) or a bond?",
    buttons: ["Contractor Insurance", "Bond"],
  },
  "Contractor Insurance": { kind: "line", line: "contractor" },
  Bond: { kind: "line", line: "bonds" },
  "Personal Auto": { kind: "line", line: "personalAuto" },
  "Home / Renters / Landlord": {
    kind: "subMenu",
    prompt: "Which one best describes you?",
    buttons: ["Home Insurance", "Renters Insurance", "Landlord Insurance"],
  },
  "Home Insurance": { kind: "line", line: "home" },
  "Renters Insurance": { kind: "line", line: "renters" },
  "Landlord Insurance": { kind: "line", line: "landlord" },
  "Umbrella Insurance": { kind: "line", line: "umbrella" },
  "Report a Claim": { kind: "line", line: "claims" },
  "I have a question": { kind: "question" },
  "Talk to a person": { kind: "humanHandoff" },
  "DOT Compliance Services": { kind: "line", line: "dotCompliance" },
} as const;
