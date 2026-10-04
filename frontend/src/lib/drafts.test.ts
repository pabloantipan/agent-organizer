import { describe, expect, it } from "vitest";
import { branchKey, cardKey, decisionKey, draftStore, draftVerb, newThreadKey, threadKey } from "./drafts";

const A = decisionKey("init-a", "0004");
const B = decisionKey("init-b", "0002");
const C = cardKey("init-a", "alpha-card");
const T = threadKey("init-a", "01THREAD");
const N = newThreadKey("init-a");

describe("one draft per key for the session (FR-9, leftovers-9 FR-1)", () => {
  it("names record and thread keys apart", () => {
    expect([A, C, T, N, branchKey("init-a", "01MSG")]).toEqual([
      "decision:init-a/0004", "card:init-a/alpha-card", "thread:init-a/01THREAD", "thread:init-a/new", "thread:init-a/branch:01MSG",
    ]);
  });

  it("restores nothing for an unseen key", () => {
    const s = draftStore();
    expect(s.restore(A)).toBeUndefined();
    expect(s.has(A)).toBe(false);
  });

  it("keeps a ruling's words when another record's box opens, and restores them", () => {
    const s = draftStore();
    s.keep(A, { chosen: "accept", words: "because" });
    s.edit(B, { words: "other" });
    expect(s.restore(A)).toEqual({ chosen: "accept", words: "because" });
    expect(s.restore(B)).toEqual({ words: "other" });
  });

  it("merges an edit into what is kept", () => {
    const s = draftStore();
    s.edit(A, { chosen: "accept" });
    s.edit(A, { words: "why" });
    expect(s.restore(A)).toEqual({ chosen: "accept", words: "why" });
  });

  it("keeps a card comment and a composer message per key", () => {
    const s = draftStore();
    s.keep(C, { text: "a comment" });
    s.keep(T, { body: "a reply" });
    expect(s.restore(C)).toEqual({ text: "a comment" });
    expect(s.restore(T)).toEqual({ body: "a reply" });
  });

  it("keeps a new thread's subject and body as one draft", () => {
    const s = draftStore();
    s.keep(N, { subject: "alpha-card: why", body: "" });
    s.edit(N, { body: "the body" });
    expect(s.restore(N)).toEqual({ subject: "alpha-card: why", body: "the body" });
    s.discard(N);
    expect(s.restore(N)).toBeUndefined();
  });

  it("discards only the key cancelled or posted", () => {
    const s = draftStore();
    s.keep(A, { words: "a" });
    s.keep(C, { text: "c" });
    s.keep(T, { body: "t" });
    s.discard(A);
    s.discard(T);
    expect(s.has(A)).toBe(false);
    expect(s.has(T)).toBe(false);
    expect(s.restore(C)).toEqual({ text: "c" });
  });

  it("treats a draft with every field blank as none", () => {
    const s = draftStore();
    s.keep(A, { chosen: "accept", words: "x" });
    s.keep(A, { chosen: "", words: "  " });
    expect(s.has(A)).toBe(false);
  });

  it("returns the same object until the draft changes, and tells subscribers", () => {
    const s = draftStore();
    let calls = 0;
    const off = s.subscribe(() => calls++);
    s.keep(T, { body: "x" });
    const first = s.restore(T);
    expect(s.restore(T)).toBe(first);
    const v = s.version();
    s.edit(T, { body: "xy" });
    expect(s.restore(T)).not.toBe(first);
    expect(s.version()).toBeGreaterThan(v);
    s.discard("thread:none/none");
    off();
    s.discard(T);
    expect(calls).toBe(2);
  });

  it("marks a verb while a draft is kept", () => {
    expect(draftVerb("Rule", true)).toBe("Rule · draft");
    expect(draftVerb("Rule", false)).toBe("Rule");
  });
});
