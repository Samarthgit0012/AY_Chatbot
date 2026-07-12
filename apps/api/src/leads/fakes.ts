import type { LeadPayload } from "../conversation/types.js";
import type { LeadLogEvent, LeadNotifier, LeadSheetWriter, Logger, WriteAheadLog } from "./types.js";

export class InMemoryWriteAheadLog implements WriteAheadLog {
  public readonly events: LeadLogEvent[] = [];

  async append(event: LeadLogEvent): Promise<void> {
    this.events.push(event);
  }

  async readUnconfirmed(): Promise<LeadLogEvent[]> {
    const latestQueuedByLeadId = new Map<string, LeadLogEvent>();
    const confirmedLeadIds = new Set<string>();
    for (const event of this.events) {
      if (event.type === "queued") latestQueuedByLeadId.set(event.leadId, event);
      if (event.type === "confirmed") confirmedLeadIds.add(event.leadId);
    }
    return [...latestQueuedByLeadId.values()].filter((e) => !confirmedLeadIds.has(e.leadId));
  }
}

/** Fails the first `failuresBeforeSuccess` calls, then succeeds — for exercising retry logic. */
export class FlakySheetWriter implements LeadSheetWriter {
  public callCount = 0;
  public readonly received: LeadPayload[] = [];

  constructor(private readonly failuresBeforeSuccess: number) {}

  async appendRow(payload: LeadPayload): Promise<void> {
    this.callCount += 1;
    if (this.callCount <= this.failuresBeforeSuccess) {
      throw new Error(`Simulated Sheets API failure #${this.callCount}`);
    }
    this.received.push(payload);
  }
}

export class AlwaysFailingSheetWriter implements LeadSheetWriter {
  public callCount = 0;

  async appendRow(): Promise<void> {
    this.callCount += 1;
    throw new Error("Simulated permanent Sheets API failure");
  }
}

export class RecordingNotifier implements LeadNotifier {
  public readonly notified: LeadPayload[] = [];

  async notify(payload: LeadPayload): Promise<void> {
    this.notified.push(payload);
  }
}

export class RecordingLogger implements Logger {
  public readonly errors: Array<{ message: string; meta?: Record<string, unknown> | undefined }> = [];
  public readonly warnings: Array<{ message: string; meta?: Record<string, unknown> | undefined }> = [];

  error(message: string, meta?: Record<string, unknown>): void {
    this.errors.push({ message, meta });
  }

  warn(message: string, meta?: Record<string, unknown>): void {
    this.warnings.push({ message, meta });
  }
}
