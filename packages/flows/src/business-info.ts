export const BUSINESS_INFO = {
  agencyName: "Revas Insurance Agency",
  botName: "Riva",
  phone: "980-474-9342",
  email: "info@revasins.com",
  businessHours: "Mon–Fri, 9AM–6PM EST",
  businessHoursStart: 9,
  businessHoursEnd: 18,
  businessHoursTimezone: "America/New_York",
} as const;

export const OPENING_MESSAGE = `Hey there! I'm Riva, your virtual assistant at Revas Insurance Agency. Whether you need help with trucking insurance, commercial or personal auto, home insurance services, or anything in between — I'm here to help! Before we get started, can I ask what state you're in?"`;

export const OUT_OF_APPETITE_MESSAGE = `Thanks for reaching out! Unfortunately, we're currently licensed to serve clients in Oregon, Washington, North Carolina, South Carolina, Ohio, Tennessee, Missouri, and Florida. If you're in one of those states and were mistaken about your location, let me know! Otherwise, I'd recommend reaching out to your state's Department of Insurance for a referral. I'm sorry I can't be of more help today!`;

export const OUT_OF_APPETITE_DOT_EXCEPTION =
  "For DOT compliance services we are available in any state.";

export const MAIN_MENU_BUTTONS = [
  "Commercial Trucking",
  "Commercial Auto",
  "Business / General Liability",
  "Contractor Insurance / Bonds",
  "Personal Auto",
  "Home / Renters / Landlord",
  "Umbrella Insurance",
  "Report a Claim",
  "I have a question",
  "Talk to a person",
] as const;

export const CLOSING_MESSAGE = `Is there anything else I can help you with today? Remember, our team is always just a call or email away — ${BUSINESS_INFO.phone} | ${BUSINESS_INFO.email} | ${BUSINESS_INFO.businessHours}. Thanks for stopping by Revas Insurance — we appreciate you! \u{1F60A}`;
