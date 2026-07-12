import type { LeadPayload } from "../conversation/types.js";

export interface LeadSheetWriter {
  appendRow(payload: LeadPayload): Promise<void>;
}

export interface LeadNotifier {
  notify(payload: LeadPayload): Promise<void>;
}

export interface Logger {
  error(message: string, meta?: Record<string, unknown>): void;
  warn(message: string, meta?: Record<string, unknown>): void;
}

export type LeadLogEventType = "queued" | "confirmed" | "failed";

export interface LeadLogEvent {
  readonly type: LeadLogEventType;
  readonly leadId: string;
  readonly timestamp: string;
  readonly payload?: LeadPayload | undefined;
  readonly error?: string | undefined;
}

export interface WriteAheadLog {
  append(event: LeadLogEvent): Promise<void>;
  /** Leads with a "queued" event but no later "confirmed" event — candidates for replay. */
  readUnconfirmed(): Promise<LeadLogEvent[]>;
}
