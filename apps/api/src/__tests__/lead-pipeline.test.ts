import { describe, expect, it } from "vitest";
import { replayUnconfirmedLeads, submitLead } from "../leads/pipeline.js";
import {
  AlwaysFailingSheetWriter,
  FlakySheetWriter,
  InMemoryWriteAheadLog,
  RecordingLogger,
  RecordingNotifier,
} from "../leads/fakes.js";
import type { LeadPayload } from "../conversation/types.js";

const samplePayload: LeadPayload = {
  line: "trucking",
  answers: { firstName: "Jamie", phone: "555-0100" },
  tags: [],
  submittedAt: "2026-01-01T00:00:00.000Z",
};

const noopSleep = async () => {};

describe("submitLead", () => {
  it("writes to the log before attempting Sheets, confirms on success, and always notifies", async () => {
    const writeAheadLog = new InMemoryWriteAheadLog();
    const sheetWriter = new FlakySheetWriter(0);
    const notifier = new RecordingNotifier();
    const logger = new RecordingLogger();

    const result = await submitLead(
      { writeAheadLog, sheetWriter, notifier, logger, sleep: noopSleep },
      samplePayload,
    );

    expect(result.sheetsOk).toBe(true);
    expect(result.notified).toBe(true);
    expect(sheetWriter.received).toHaveLength(1);
    expect(notifier.notified).toHaveLength(1);

    const eventTypes = writeAheadLog.events.map((e) => e.type);
    expect(eventTypes).toEqual(["queued", "confirmed"]);
    expect(logger.errors).toHaveLength(0);
  });

  it("retries on transient Sheets failures and confirms once it succeeds", async () => {
    const writeAheadLog = new InMemoryWriteAheadLog();
    const sheetWriter = new FlakySheetWriter(2); // fails twice, succeeds on 3rd
    const notifier = new RecordingNotifier();
    const logger = new RecordingLogger();

    const result = await submitLead(
      { writeAheadLog, sheetWriter, notifier, logger, maxRetries: 3, sleep: noopSleep },
      samplePayload,
    );

    expect(result.sheetsOk).toBe(true);
    expect(sheetWriter.callCount).toBe(3);
    expect(writeAheadLog.events.map((e) => e.type)).toEqual(["queued", "confirmed"]);
  });

  it("never loses a lead notification even when every Sheets retry fails", async () => {
    const writeAheadLog = new InMemoryWriteAheadLog();
    const sheetWriter = new AlwaysFailingSheetWriter();
    const notifier = new RecordingNotifier();
    const logger = new RecordingLogger();

    const result = await submitLead(
      { writeAheadLog, sheetWriter, notifier, logger, maxRetries: 3, sleep: noopSleep },
      samplePayload,
    );

    expect(result.sheetsOk).toBe(false);
    expect(sheetWriter.callCount).toBe(3);
    // The critical guarantee: staff still get notified even though Sheets is down.
    expect(result.notified).toBe(true);
    expect(notifier.notified).toHaveLength(1);

    const eventTypes = writeAheadLog.events.map((e) => e.type);
    expect(eventTypes).toEqual(["queued", "failed"]);
    expect(logger.errors.length).toBeGreaterThan(0);
  });

  it("logs but does not throw if the notifier itself fails", async () => {
    const writeAheadLog = new InMemoryWriteAheadLog();
    const sheetWriter = new FlakySheetWriter(0);
    const notifier = { notify: async () => { throw new Error("SMTP down"); } };
    const logger = new RecordingLogger();

    const result = await submitLead(
      { writeAheadLog, sheetWriter, notifier, logger, sleep: noopSleep },
      samplePayload,
    );

    expect(result.sheetsOk).toBe(true);
    expect(result.notified).toBe(false);
    expect(logger.errors.some((e) => e.message.includes("notification"))).toBe(true);
  });

  it("writes the queued event before any Sheets attempt happens", async () => {
    const writeAheadLog = new InMemoryWriteAheadLog();
    let queuedBeforeSheetsCall = false;
    const sheetWriter = {
      appendRow: async () => {
        queuedBeforeSheetsCall = writeAheadLog.events.some((e) => e.type === "queued");
      },
    };
    const notifier = new RecordingNotifier();
    const logger = new RecordingLogger();

    await submitLead({ writeAheadLog, sheetWriter, notifier, logger, sleep: noopSleep }, samplePayload);
    expect(queuedBeforeSheetsCall).toBe(true);
  });
});

describe("replayUnconfirmedLeads", () => {
  it("confirms a previously failed lead once Sheets recovers", async () => {
    const writeAheadLog = new InMemoryWriteAheadLog();
    const failingWriter = new AlwaysFailingSheetWriter();
    const notifier = new RecordingNotifier();
    const logger = new RecordingLogger();

    await submitLead(
      { writeAheadLog, sheetWriter: failingWriter, notifier, logger, maxRetries: 1, sleep: noopSleep },
      samplePayload,
    );
    expect((await writeAheadLog.readUnconfirmed())).toHaveLength(1);

    const recoveredWriter = new FlakySheetWriter(0);
    const replayResult = await replayUnconfirmedLeads({
      writeAheadLog,
      sheetWriter: recoveredWriter,
      logger,
    });

    expect(replayResult.replayed).toBe(1);
    expect(replayResult.stillFailing).toBe(0);
    expect((await writeAheadLog.readUnconfirmed())).toHaveLength(0);
  });

  it("leaves a lead unconfirmed and logs a warning if Sheets is still down", async () => {
    const writeAheadLog = new InMemoryWriteAheadLog();
    const failingWriter = new AlwaysFailingSheetWriter();
    const notifier = new RecordingNotifier();
    const logger = new RecordingLogger();

    await submitLead(
      { writeAheadLog, sheetWriter: failingWriter, notifier, logger, maxRetries: 1, sleep: noopSleep },
      samplePayload,
    );

    const replayResult = await replayUnconfirmedLeads({
      writeAheadLog,
      sheetWriter: failingWriter,
      logger,
    });

    expect(replayResult.replayed).toBe(0);
    expect(replayResult.stillFailing).toBe(1);
    expect(logger.warnings.length).toBeGreaterThan(0);
  });
});
