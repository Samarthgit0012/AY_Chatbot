import { google } from "googleapis";
import type { LeadPayload } from "../conversation/types.js";
import type { LeadSheetWriter } from "./types.js";

export interface GoogleSheetsConfig {
  readonly spreadsheetId: string;
  readonly sheetName: string;
  readonly serviceAccountEmail: string;
  readonly privateKey: string;
}

/** Column order for the appended row — kept in one place so the sheet header can be matched by hand. */
export function buildLeadRow(payload: LeadPayload): string[] {
  return [
    payload.submittedAt,
    payload.line ?? "(none — human handoff)",
    payload.tags.join(", "),
    payload.answers.firstName ?? "",
    payload.answers.lastName ?? "",
    payload.answers.phone ?? "",
    payload.answers.email ?? "",
    payload.answers.state ?? "",
    payload.answers.bestTimeToContact ?? "",
    payload.answers.preferredContactMethod ?? "",
    JSON.stringify(payload.answers),
  ];
}

/**
 * Writes one row per lead via an authenticated service account (scoped to
 * exactly this spreadsheet — see PLAN.md §8 least-privilege note), replacing
 * the demo's open webhook with a proper server-side, credentialed call.
 */
export class GoogleSheetsLeadWriter implements LeadSheetWriter {
  private readonly sheets: ReturnType<typeof google.sheets>;
  private readonly config: GoogleSheetsConfig;

  constructor(config: GoogleSheetsConfig) {
    this.config = config;
    const auth = new google.auth.JWT({
      email: config.serviceAccountEmail,
      key: config.privateKey,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    this.sheets = google.sheets({ version: "v4", auth });
  }

  async appendRow(payload: LeadPayload): Promise<void> {
    await this.sheets.spreadsheets.values.append({
      spreadsheetId: this.config.spreadsheetId,
      range: `${this.config.sheetName}!A1`,
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      requestBody: { values: [buildLeadRow(payload)] },
    });
  }
}
