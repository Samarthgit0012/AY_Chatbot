import { randomUUID } from "node:crypto";
import { INITIAL_STATE, type ConversationState } from "../conversation/types.js";

export interface SessionStore {
  create(): string;
  get(sessionId: string): ConversationState | undefined;
  set(sessionId: string, state: ConversationState): void;
  delete(sessionId: string): void;
  readonly size: number;
}

interface SessionEntry {
  state: ConversationState;
  expiresAt: number;
}

const DEFAULT_TTL_MS = 30 * 60 * 1000;

/**
 * Server-memory-only session store (PLAN.md §5.5 — no database, no
 * resilience across restarts by design). Sliding TTL: any read or write
 * extends the session's life, and abandoned sessions are pruned on a
 * timer so idle conversations don't leak memory indefinitely.
 */
export class InMemorySessionStore implements SessionStore {
  private readonly sessions = new Map<string, SessionEntry>();

  constructor(private readonly ttlMs: number = DEFAULT_TTL_MS) {}

  get size(): number {
    return this.sessions.size;
  }

  create(): string {
    const id = randomUUID();
    this.sessions.set(id, { state: INITIAL_STATE, expiresAt: Date.now() + this.ttlMs });
    return id;
  }

  get(sessionId: string): ConversationState | undefined {
    const entry = this.sessions.get(sessionId);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.sessions.delete(sessionId);
      return undefined;
    }
    entry.expiresAt = Date.now() + this.ttlMs;
    return entry.state;
  }

  set(sessionId: string, state: ConversationState): void {
    this.sessions.set(sessionId, { state, expiresAt: Date.now() + this.ttlMs });
  }

  delete(sessionId: string): void {
    this.sessions.delete(sessionId);
  }

  /** Removes expired entries. Call on a timer (see startCleanupInterval) rather than per-request. */
  pruneExpired(): number {
    const now = Date.now();
    let pruned = 0;
    for (const [id, entry] of this.sessions) {
      if (now > entry.expiresAt) {
        this.sessions.delete(id);
        pruned += 1;
      }
    }
    return pruned;
  }

  startCleanupInterval(intervalMs = 5 * 60 * 1000): NodeJS.Timeout {
    const timer = setInterval(() => this.pruneExpired(), intervalMs);
    timer.unref();
    return timer;
  }
}
