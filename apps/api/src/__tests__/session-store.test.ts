import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { InMemorySessionStore } from "../session/store.js";

describe("InMemorySessionStore", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("creates a session initialized to the awaitingState phase", () => {
    const store = new InMemorySessionStore();
    const id = store.create();
    const state = store.get(id);
    expect(state?.phase).toBe("awaitingState");
  });

  it("persists writes made via set()", () => {
    const store = new InMemorySessionStore();
    const id = store.create();
    const original = store.get(id)!;
    store.set(id, { ...original, phase: "mainMenu" });
    expect(store.get(id)?.phase).toBe("mainMenu");
  });

  it("returns undefined for an unknown session id", () => {
    const store = new InMemorySessionStore();
    expect(store.get("does-not-exist")).toBeUndefined();
  });

  it("expires a session after the TTL elapses with no activity", () => {
    const store = new InMemorySessionStore(1000);
    const id = store.create();
    vi.advanceTimersByTime(1001);
    expect(store.get(id)).toBeUndefined();
  });

  it("slides the expiry forward on every read", () => {
    const store = new InMemorySessionStore(1000);
    const id = store.create();

    vi.advanceTimersByTime(700);
    expect(store.get(id)).toBeDefined(); // read extends TTL by another 1000ms

    vi.advanceTimersByTime(700);
    expect(store.get(id)).toBeDefined(); // still alive because of the sliding read above

    vi.advanceTimersByTime(1001);
    expect(store.get(id)).toBeUndefined();
  });

  it("removes a session on delete()", () => {
    const store = new InMemorySessionStore();
    const id = store.create();
    store.delete(id);
    expect(store.get(id)).toBeUndefined();
  });

  it("pruneExpired removes only expired sessions and reports the count", () => {
    const store = new InMemorySessionStore(1000);
    const staysAlive = store.create();
    vi.advanceTimersByTime(700);
    const expires = store.create();
    vi.advanceTimersByTime(400); // staysAlive is now 1100ms old (expired), expires is 400ms old (alive)

    const pruned = store.pruneExpired();
    expect(pruned).toBe(1);
    expect(store.get(staysAlive)).toBeUndefined();
    expect(store.get(expires)).toBeDefined();
  });

  it("reports size accurately", () => {
    const store = new InMemorySessionStore();
    expect(store.size).toBe(0);
    store.create();
    store.create();
    expect(store.size).toBe(2);
  });
});
