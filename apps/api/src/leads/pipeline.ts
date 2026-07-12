import { randomUUID } from "node:crypto";
import type { LeadPayload } from "../conversation/types.js";
import type { LeadNotifier, LeadSheetWriter, Logger, WriteAheadLog } from "./types.js";

export interface LeadPipelineDeps {
  readonly writeAheadLog: WriteAheadLog;
  readonly sheetWriter: LeadSheetWriter;
  readonly notifier: LeadNotifier;
  readonly logger: Logger;
  readonly maxRetries?: number;
  /** Injectable for tests; defaults to a real exponential-backoff sleep. */
  readonly sleep?: (ms: number) => Promise<void>;
}

export interface LeadSubmissionResult {
  readonly leadId: string;
  readonly sheetsOk: boolean;
  readonly notified: boolean;
}

const DEFAULT_MAX_RETRIES = 3;

function backoffMs(attempt: number): number {
  return 200 * 2 ** (attempt - 1); // 200ms, 400ms, 800ms, ...
}

function defaultSleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * The full lead-delivery path (PLAN.md §6): write-ahead log first (so a
 * lead is durable on disk before any network call), then Sheets with
 * retry, then an internal email notification that fires regardless of
 * whether Sheets ultimately succeeded — a Sheets outage must never mean
 * staff hear nothing about a new lead.
 */
export async function submitLead(
  deps: LeadPipelineDeps,
  payload: LeadPayload,
): Promise<LeadSubmissionResult> {
  const leadId = randomUUID();
  const maxRetries = deps.maxRetries ?? DEFAULT_MAX_RETRIES;
  const sleep = deps.sleep ?? defaultSleep;

  await deps.writeAheadLog.append({
    type: "queued",
    leadId,
    payload,
    timestamp: new Date().toISOString(),
  });

  let sheetsOk = false;
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
    try {
      await deps.sheetWriter.appendRow(payload);
      sheetsOk = true;
      break;
    } catch (error) {
      lastError = error;
      if (attempt < maxRetries) {
        await sleep(backoffMs(attempt));
      }
    }
  }

  if (sheetsOk) {
    await deps.writeAheadLog.append({ type: "confirmed", leadId, timestamp: new Date().toISOString() });
  } else {
    const errorMessage = lastError instanceof Error ? lastError.message : String(lastError);
    await deps.writeAheadLog.append({
      type: "failed",
      leadId,
      timestamp: new Date().toISOString(),
      error: errorMessage,
    });
    deps.logger.error("Failed to write lead to Google Sheets after retries", { leadId, error: errorMessage });
  }

  let notified = false;
  try {
    await deps.notifier.notify(payload);
    notified = true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    deps.logger.error("Failed to send internal lead notification email", { leadId, error: errorMessage });
  }

  return { leadId, sheetsOk, notified };
}

/**
 * Replays leads whose write-ahead log entry was never confirmed against
 * Sheets — intended to run on a periodic job (e.g. a daily cron) per
 * PLAN.md §6, independent of the live request path.
 */
export async function replayUnconfirmedLeads(
  deps: Pick<LeadPipelineDeps, "writeAheadLog" | "sheetWriter" | "logger">,
): Promise<{ replayed: number; stillFailing: number }> {
  const unconfirmed = await deps.writeAheadLog.readUnconfirmed();
  let replayed = 0;
  let stillFailing = 0;

  for (const event of unconfirmed) {
    if (!event.payload) continue;
    try {
      await deps.sheetWriter.appendRow(event.payload);
      await deps.writeAheadLog.append({
        type: "confirmed",
        leadId: event.leadId,
        timestamp: new Date().toISOString(),
      });
      replayed += 1;
    } catch (error) {
      stillFailing += 1;
      deps.logger.warn("Replay of unconfirmed lead still failing", {
        leadId: event.leadId,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return { replayed, stillFailing };
}
