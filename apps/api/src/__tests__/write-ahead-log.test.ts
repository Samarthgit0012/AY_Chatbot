import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { FileWriteAheadLog } from "../leads/write-ahead-log.js";
import type { LeadPayload } from "../conversation/types.js";

const samplePayload: LeadPayload = {
  line: "home",
  answers: { firstName: "Sam" },
  tags: [],
  submittedAt: "2026-01-01T00:00:00.000Z",
};

describe("FileWriteAheadLog", () => {
  let dir: string;
  let filePath: string;

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), "riva-wal-"));
    filePath = join(dir, "leads.jsonl");
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it("returns an empty list when the file does not exist yet", async () => {
    const log = new FileWriteAheadLog(filePath);
    expect(await log.readUnconfirmed()).toEqual([]);
  });

  it("creates the file (and parent directory) on first append", async () => {
    const nested = join(dir, "nested", "leads.jsonl");
    const log = new FileWriteAheadLog(nested);
    await log.append({ type: "queued", leadId: "abc", timestamp: "t", payload: samplePayload });
    expect(await log.readUnconfirmed()).toHaveLength(1);
  });

  it("treats a queued lead with no confirmed event as unconfirmed", async () => {
    const log = new FileWriteAheadLog(filePath);
    await log.append({ type: "queued", leadId: "lead-1", timestamp: "t1", payload: samplePayload });
    const unconfirmed = await log.readUnconfirmed();
    expect(unconfirmed).toHaveLength(1);
    expect(unconfirmed[0]?.leadId).toBe("lead-1");
  });

  it("excludes a lead once a confirmed event is appended", async () => {
    const log = new FileWriteAheadLog(filePath);
    await log.append({ type: "queued", leadId: "lead-1", timestamp: "t1", payload: samplePayload });
    await log.append({ type: "confirmed", leadId: "lead-1", timestamp: "t2" });
    expect(await log.readUnconfirmed()).toEqual([]);
  });

  it("keeps a failed lead in the unconfirmed set (so it can be replayed)", async () => {
    const log = new FileWriteAheadLog(filePath);
    await log.append({ type: "queued", leadId: "lead-1", timestamp: "t1", payload: samplePayload });
    await log.append({ type: "failed", leadId: "lead-1", timestamp: "t2", error: "boom" });
    const unconfirmed = await log.readUnconfirmed();
    expect(unconfirmed).toHaveLength(1);
    expect(unconfirmed[0]?.payload).toEqual(samplePayload);
  });

  it("tracks multiple leads independently", async () => {
    const log = new FileWriteAheadLog(filePath);
    await log.append({ type: "queued", leadId: "lead-1", timestamp: "t1", payload: samplePayload });
    await log.append({ type: "queued", leadId: "lead-2", timestamp: "t2", payload: samplePayload });
    await log.append({ type: "confirmed", leadId: "lead-1", timestamp: "t3" });

    const unconfirmed = await log.readUnconfirmed();
    expect(unconfirmed.map((e) => e.leadId)).toEqual(["lead-2"]);
  });

  it("survives being read by a fresh instance pointed at the same file (durability across restarts)", async () => {
    const firstProcess = new FileWriteAheadLog(filePath);
    await firstProcess.append({ type: "queued", leadId: "lead-1", timestamp: "t1", payload: samplePayload });

    const secondProcess = new FileWriteAheadLog(filePath);
    const unconfirmed = await secondProcess.readUnconfirmed();
    expect(unconfirmed).toHaveLength(1);
  });
});
