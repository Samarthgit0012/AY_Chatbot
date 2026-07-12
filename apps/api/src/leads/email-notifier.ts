import nodemailer, { type Transporter } from "nodemailer";
import { BUSINESS_INFO } from "@revas/flows";
import type { LeadPayload } from "../conversation/types.js";
import type { LeadNotifier } from "./types.js";

export interface SmtpConfig {
  readonly host: string;
  readonly port: number;
  readonly secure: boolean;
  readonly user: string;
  readonly pass: string;
  readonly fromAddress: string;
  readonly toAddress: string;
}

function formatLeadEmail(payload: LeadPayload): { subject: string; text: string } {
  const lineLabel = payload.line ?? "General / human handoff";
  const tagsLabel = payload.tags.length > 0 ? payload.tags.join(", ") : "none";
  const answerLines = Object.entries(payload.answers)
    .map(([key, value]) => `  ${key}: ${value}`)
    .join("\n");

  return {
    subject: `New lead — ${lineLabel}${payload.tags.includes("Needs Human") ? " [NEEDS HUMAN]" : ""}`,
    text: [
      `A new lead came in via the Riva chatbot.`,
      ``,
      `Line: ${lineLabel}`,
      `Tags: ${tagsLabel}`,
      `Submitted at: ${payload.submittedAt}`,
      ``,
      `Answers:`,
      answerLines,
    ].join("\n"),
  };
}

/**
 * Fires unconditionally, independent of whether the Google Sheets write
 * succeeds (PLAN.md §6) — this is the notification staff actually see, so
 * a Sheets outage must never silence it.
 */
export class SmtpLeadNotifier implements LeadNotifier {
  private readonly transporter: Transporter;
  private readonly config: SmtpConfig;

  constructor(config: SmtpConfig) {
    this.config = config;
    this.transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: { user: config.user, pass: config.pass },
    });
  }

  async notify(payload: LeadPayload): Promise<void> {
    const { subject, text } = formatLeadEmail(payload);
    await this.transporter.sendMail({
      from: this.config.fromAddress,
      to: this.config.toAddress,
      subject,
      text,
    });
  }
}

export function defaultToAddress(): string {
  return BUSINESS_INFO.email;
}
