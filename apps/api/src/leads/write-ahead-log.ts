import { appendFile, mkdir, readFile } from "node:fs/promises";
import { dirname } from "node:path";
import type { LeadLogEvent, WriteAheadLog } from "./types.js";

/**
 * Append-only JSONL file on local disk — the durability backstop described
 * in PLAN.md §6. Every lead attempt writes a "queued" event here *before*
 * the Google Sheets API call is even attempted, and a "confirmed" or
 * "failed" event after. The file is never rewritten in place; "unconfirmed"
 * leads are derived by scanning for a "queued" event with no later
 * "confirmed" event for the same leadId, so a crash mid-write can never
 * corrupt previously durable records.
 */
export class FileWriteAheadLog implements WriteAheadLog {
  constructor(private readonly filePath: string) {}

  async append(event: LeadLogEvent): Promise<void> {
    await mkdir(dirname(this.filePath), { recursive: true });
    await appendFile(this.filePath, `${JSON.stringify(event)}\n`, "utf8");
  }

  async readUnconfirmed(): Promise<LeadLogEvent[]> {
    let raw: string;
    try {
      raw = await readFile(this.filePath, "utf8");
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
      throw error;
    }

    const events = raw
      .split("\n")
      .filter((line) => line.trim().length > 0)
      .map((line) => JSON.parse(line) as LeadLogEvent);

    const latestQueuedByLeadId = new Map<string, LeadLogEvent>();
    const confirmedLeadIds = new Set<string>();

    for (const event of events) {
      if (event.type === "queued") {
        latestQueuedByLeadId.set(event.leadId, event);
      } else if (event.type === "confirmed") {
        confirmedLeadIds.add(event.leadId);
      }
    }

    return [...latestQueuedByLeadId.values()].filter((event) => !confirmedLeadIds.has(event.leadId));
  }
}
