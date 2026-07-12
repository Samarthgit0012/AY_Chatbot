export * from "./types.js";
export * from "./business-info.js";
export * from "./guardrails.js";
export * from "./escalation.js";
export * from "./lead-capture.js";
export * from "./cross-cutting/handoff.js";

export { truckingFlow } from "./lines/trucking.js";
export { commercialAutoFlow } from "./lines/commercial-auto.js";
export { generalLiabilityFlow } from "./lines/general-liability.js";
export { contractorFlow } from "./lines/contractor.js";
export { bondsFlow } from "./lines/bonds.js";
export { personalAutoFlow } from "./lines/personal-auto.js";
export { homeFlow } from "./lines/home.js";
export { rentersFlow } from "./lines/renters.js";
export { landlordFlow } from "./lines/landlord.js";
export { umbrellaFlow } from "./lines/umbrella.js";
export { claimsFlow, CLAIMS_SAFETY_RESPONSE, CLAIMS_DISCLAIMER } from "./lines/claims.js";
export { dotComplianceFlow } from "./lines/dot-compliance.js";

import type { FlowDefinition, InsuranceLine } from "./types.js";
import { truckingFlow } from "./lines/trucking.js";
import { commercialAutoFlow } from "./lines/commercial-auto.js";
import { generalLiabilityFlow } from "./lines/general-liability.js";
import { contractorFlow } from "./lines/contractor.js";
import { bondsFlow } from "./lines/bonds.js";
import { personalAutoFlow } from "./lines/personal-auto.js";
import { homeFlow } from "./lines/home.js";
import { rentersFlow } from "./lines/renters.js";
import { landlordFlow } from "./lines/landlord.js";
import { umbrellaFlow } from "./lines/umbrella.js";
import { claimsFlow } from "./lines/claims.js";
import { dotComplianceFlow } from "./lines/dot-compliance.js";

/** Every flow, keyed by line — the single lookup point the state machine uses. */
export const FLOWS_BY_LINE: Readonly<Record<InsuranceLine, FlowDefinition>> = {
  trucking: truckingFlow,
  commercialAuto: commercialAutoFlow,
  generalLiability: generalLiabilityFlow,
  contractor: contractorFlow,
  bonds: bondsFlow,
  personalAuto: personalAutoFlow,
  home: homeFlow,
  renters: rentersFlow,
  landlord: landlordFlow,
  umbrella: umbrellaFlow,
  claims: claimsFlow,
  dotCompliance: dotComplianceFlow,
};

/** Lines that bypass the state-eligibility gate (docx: "DOT compliance services we are available in any state"). */
export const NATIONWIDE_LINES: readonly InsuranceLine[] = ["dotCompliance"];
