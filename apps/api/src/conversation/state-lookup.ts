import { ELIGIBLE_STATES, type EligibleState } from "@revas/flows";

const STATE_NAMES: Readonly<Record<EligibleState, string>> = {
  OR: "Oregon",
  WA: "Washington",
  NC: "North Carolina",
  SC: "South Carolina",
  OH: "Ohio",
  TN: "Tennessee",
  MO: "Missouri",
  FL: "Florida",
};

const LOOKUP = new Map<string, EligibleState>();
for (const code of ELIGIBLE_STATES) {
  LOOKUP.set(code.toLowerCase(), code);
  LOOKUP.set(STATE_NAMES[code].toLowerCase(), code);
}

/** Parses free text like "Oregon", "oregon", or "OR" into an eligible state code. Returns null if it isn't one of our eight licensed states (which does not necessarily mean it's an invalid US state — see the ineligible-state flow). */
export function parseEligibleState(text: string): EligibleState | null {
  return LOOKUP.get(text.trim().toLowerCase()) ?? null;
}

export function stateLabel(code: EligibleState): string {
  return STATE_NAMES[code];
}

/** Every US state/territory name and abbreviation, used only to distinguish "a real state we don't serve" from "not a recognizable state at all" so the bot can give the right response in each case. */
const ALL_US_STATES: Readonly<Record<string, string>> = {
  al: "Alabama",
  ak: "Alaska",
  az: "Arizona",
  ar: "Arkansas",
  ca: "California",
  co: "Colorado",
  ct: "Connecticut",
  de: "Delaware",
  fl: "Florida",
  ga: "Georgia",
  hi: "Hawaii",
  id: "Idaho",
  il: "Illinois",
  in: "Indiana",
  ia: "Iowa",
  ks: "Kansas",
  ky: "Kentucky",
  la: "Louisiana",
  me: "Maine",
  md: "Maryland",
  ma: "Massachusetts",
  mi: "Michigan",
  mn: "Minnesota",
  ms: "Mississippi",
  mo: "Missouri",
  mt: "Montana",
  ne: "Nebraska",
  nv: "Nevada",
  nh: "New Hampshire",
  nj: "New Jersey",
  nm: "New Mexico",
  ny: "New York",
  nc: "North Carolina",
  nd: "North Dakota",
  oh: "Ohio",
  ok: "Oklahoma",
  or: "Oregon",
  pa: "Pennsylvania",
  ri: "Rhode Island",
  sc: "South Carolina",
  sd: "South Dakota",
  tn: "Tennessee",
  tx: "Texas",
  ut: "Utah",
  vt: "Vermont",
  va: "Virginia",
  wa: "Washington",
  wv: "West Virginia",
  wi: "Wisconsin",
  wy: "Wyoming",
  dc: "District of Columbia",
};

const ALL_US_STATES_LOOKUP = new Map<string, string>();
for (const [abbr, name] of Object.entries(ALL_US_STATES)) {
  ALL_US_STATES_LOOKUP.set(abbr, name);
  ALL_US_STATES_LOOKUP.set(name.toLowerCase(), name);
}

/** Recognizes any real US state name/abbreviation (not just the eight we serve), so we can distinguish "we don't serve this state" from "that isn't a state." */
export function isRecognizableUsState(text: string): boolean {
  return ALL_US_STATES_LOOKUP.has(text.trim().toLowerCase());
}
