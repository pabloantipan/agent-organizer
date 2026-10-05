import { describe, expect, it } from "vitest";
import { branchKey, cardKey, chatKey, decisionKey, draftStore, draftVerb, imeCompositionEnd, imeEscapeKey, newThreadKey, newThreadPost, threadKey } from "./drafts";

const A = decisionKey("init-a", "0004");
const B = decisionKey("init-b", "0002");
const C = cardKey("init-a", "alpha-card");
const T = threadKey("init-a", "01THREAD");
const N = newThreadKey("init-a", "channel");

describe("one draft per key for the session (FR-9, leftovers-9 FR-1)", () => {
  it("names record and thread keys apart", () => {
    expect([A, C, T, N, branchKey("init-a", "01MSG")]).toEqual([
      "decision:init-a/0004", "card:init-a/alpha-card", "thread:init-a/01THREAD", "thread:init-a/new:channel", "thread:init-a/branch:01MSG",
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

describe("a new thread's draft belongs to its chat (leftovers-10 FR-1, T1)", () => {
  const chatA = chatKey("fse", "channel");
  const chatB = chatKey("po_ana", "channel");
  const keyA = newThreadKey("init-a", chatA);
  const keyB = newThreadKey("init-a", chatB);

  it("names each chat apart: a seat's direct chat, the channel, needs me", () => {
    expect([chatA, chatB, chatKey(null, "channel"), chatKey(null, "needs")]).toEqual(["seat:fse", "seat:po_ana", "channel", "needs"]);
    expect(new Set([keyA, keyB, newThreadKey("init-a", "channel"), newThreadKey("init-a", "needs"), newThreadKey("init-b", chatA)]).size).toBe(5);
  });

  it("brings A's draft and addressee back after B's form, and B's form is empty", () => {
    const s = draftStore();
    s.keep(keyA, { subject: "alpha-card: why", body: "the body", to: "fse" });
    // Switch to B and open a new thread there: nothing of A's shows.
    expect(s.restore(keyB)).toBeUndefined();
    expect(s.has(keyB)).toBe(false);
    // Back to A.
    expect(s.restore(keyA)).toEqual({ subject: "alpha-card: why", body: "the body", to: "fse" });
  });

  it("keeps A's addressee, everyone included, apart from B's", () => {
    const s = draftStore();
    s.keep(keyA, { subject: "a", body: "x", to: "" });
    s.keep(keyB, { subject: "b", body: "y", to: "po_ana" });
    expect(newThreadPost(s, "init-a", chatA)).toEqual({ subject: "a", body: "x", to: "" });
    expect(newThreadPost(s, "init-a", chatB)).toEqual({ subject: "b", body: "y", to: "po_ana" });
  });

  it("posts nothing keyed to A from B", () => {
    const s = draftStore();
    s.keep(keyA, { subject: "alpha-card: why", body: "the body", to: "fse" });
    expect(newThreadPost(s, "init-a", chatB)).toBeNull();
    expect(newThreadPost(s, "init-a", "channel")).toBeNull();
    expect(newThreadPost(s, "init-b", chatA)).toBeNull();
    expect(newThreadPost(s, "init-a", chatA)).toEqual({ subject: "alpha-card: why", body: "the body", to: "fse" });
  });

  it("an addressee alone is no draft", () => {
    const s = draftStore();
    s.keep(keyA, { subject: "", body: " ", to: "fse", kind: "question" });
    expect(s.has(keyA)).toBe(false);
  });

  it("posts nothing from a chat whose draft lacks a subject or a body", () => {
    const s = draftStore();
    s.keep(keyA, { subject: "only a subject", body: "", to: "fse" });
    expect(newThreadPost(s, "init-a", chatA)).toBeNull();
  });
});

describe("an Escape that ends a composition commits nothing (leftovers-10 FR-5, T4)", () => {
  const run = () => {
    let value = "caf";
    const set = (v: string) => { value = v; };
    return { get: () => value, set };
  };

  it("WebKit: the composition ends first, committing ´, then Escape as 229: the field goes back", () => {
    const f = run();
    const st = { before: "caf", pending: false };   // compositionstart
    f.set("caf´");                                   // marked text
    imeCompositionEnd(st, f.set, (fn) => fn());      // committed
    expect(imeEscapeKey(st, "Escape", 229, false, f.set)).toBe(true);
    expect(f.get()).toBe("caf");
  });

  it("WKWebView as measured: the composition commits ´, then the Escape comes as keyCode 27 keyed ´", () => {
    const f = run();
    const st = { before: "caf", pending: false };    // compositionstart
    f.set("caf´");                                    // insertCompositionText
    f.set("caf´");                                    // insertFromComposition
    imeCompositionEnd(st, f.set, (fn) => fn());       // compositionend, data ´
    expect(imeEscapeKey(st, "´", 27, false, f.set)).toBe(true);
    expect(f.get()).toBe("caf");
  });

  it("a plain Escape right after a composed é closes the box and keeps the é", () => {
    const f = run();
    const st = { before: "caf", pending: false };
    f.set("café");
    imeCompositionEnd(st, f.set, (fn) => fn());
    expect(imeEscapeKey(st, "Escape", 27, false, f.set)).toBe(false);
    expect(f.get()).toBe("café");
  });

  it("Chromium: Escape while composing, then the composition ends: the field goes back", () => {
    const f = run();
    const st = { before: "caf", pending: false };
    f.set("caf´");
    expect(imeEscapeKey(st, "Escape", 229, true, f.set)).toBe(true);
    imeCompositionEnd(st, f.set, (fn) => fn());
    expect(f.get()).toBe("caf");
  });

  it("a composition that ends by a letter keeps it, and a plain Escape is the box's", () => {
    const f = run();
    const st = { before: "caf", pending: false };
    f.set("café");
    imeCompositionEnd(st, f.set, (fn) => fn());
    expect(imeEscapeKey(st, "e", 229, false, f.set)).toBe(false);
    expect(f.get()).toBe("café");
    expect(imeEscapeKey(st, "Escape", 27, false, f.set)).toBe(false);
    expect(imeEscapeKey(st, "Escape", 229, false, f.set)).toBe(true);
    expect(f.get()).toBe("café");
  });
});
