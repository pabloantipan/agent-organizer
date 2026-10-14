import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import type { Seat } from "../hooks/useWails";
import { HEALTH } from "../lib/health";

// The store is a plain object here (as Rail.said.test): People reads none of
// it, but SlackView's module imports it.
vi.mock("../stores/board.store", () => ({ useBoard: Object.assign(() => ({}), { getState: () => ({}), setState: () => undefined }) }));
const { People, personBadge, personFacts } = await import("./SlackView");

const ctx = (used_percent: number) => ({ session_id: "s", model: "opus", used_percent, input_tokens: 1000, window_size: 200000, cost_usd: 0, transcript: "", updated_at: null });
const seat = (over: Partial<Record<string, unknown>> = {}) =>
  ({ name: "dev_ana", agent: { state: "working", context: ctx(41.6) }, watcher: "alive", deaf: false, capped: false, owes: [], ...over }) as unknown as Seat;
const owing = (n: number) => Array.from({ length: n }, (_, i) => ({ id: `t${i}`, subject: `s${i}` }));

describe("W1: F3's description says each fact with its noun (leftovers-26 FR-4, T23)", () => {
  it("live, alive, owes nothing: no owes fact", () => {
    expect(personFacts(seat())).toBe(`session live, mail ${HEALTH.alive.label}, context 42%`);
  });
  it("off, stale, owes 1: `owes 1 message`", () => {
    expect(personFacts(seat({ agent: undefined, watcher: "stale", owes: owing(1) }))).toBe(`session off, mail ${HEALTH.stale.label}, owes 1 message`);
  });
  it("owes 2: `owes 2 messages`", () => {
    expect(personFacts(seat({ owes: owing(2) }))).toBe(`session live, mail ${HEALTH.alive.label}, owes 2 messages, context 42%`);
  });
  it("an idle session says the state word; capped and deaf read HEALTH's labels", () => {
    expect(personFacts(seat({ agent: { state: "running", context: ctx(10) }, watcher: "alive", capped: true }))).toBe(`session live, mail ${HEALTH.capped.label}, context 10%`);
    expect(personFacts(seat({ agent: { state: "exited" }, watcher: "stale", deaf: true }))).toBe(`session exited, mail ${HEALTH.deaf.label}`);
  });
  it("no watcher, no mail fact; no window yet, context unknown", () => {
    expect(personFacts(seat({ watcher: "", agent: { state: "working", context: { ...ctx(0), window_size: 0 } } }))).toBe("session live, context unknown");
  });
  it("no count is said without its noun", () => {
    for (const n of [0, 1, 2, 25]) expect(personFacts(seat({ owes: owing(n) }))).not.toMatch(/owes \d+(?![\d ]*messages?)/);
    expect(personFacts(seat({ owes: owing(1) }))).not.toContain("1 messages");
  });
});

describe("W1: the waiting count follows the mail word (leftovers-27 FR-9, T23)", () => {
  const states: [string, Partial<Record<string, unknown>>][] = [
    ["alive", { watcher: "alive" }],
    ["stale", { watcher: "stale" }],
    ["deaf", { watcher: "stale", deaf: true }],
    ["capped", { watcher: "alive", capped: true }],
  ];
  for (const [label, over] of states) {
    it(`${label}: nothing at 0, \`1 message waiting\`, \`2 messages waiting\``, () => {
      const word = HEALTH[label as keyof typeof HEALTH].label;
      expect(personFacts(seat({ ...over, undelivered: 0 }))).toBe(`session live, mail ${word}, context 42%`);
      expect(personFacts(seat({ ...over, undelivered: 1 }))).toBe(`session live, mail ${word}, 1 message waiting, context 42%`);
      expect(personFacts(seat({ ...over, undelivered: 2, owes: owing(2) }))).toBe(`session live, mail ${word}, 2 messages waiting, owes 2 messages, context 42%`);
    });
  }
  it("the spec's line: `session off, mail stale, 1 message waiting, owes 2 messages`", () => {
    expect(personFacts(seat({ agent: undefined, watcher: "stale", undelivered: 1, owes: owing(2) }))).toBe("session off, mail stale, 1 message waiting, owes 2 messages");
  });
  it("no badge, no count: without a watcher the waiting count is not said", () => {
    expect(personFacts(seat({ watcher: "", undelivered: 3 }))).toBe("session live, context 42%");
  });
});

describe("W1: a person row names its one description (AX shape, server render)", () => {
  it("aria-describedby points at one sr-only line holding the FR-4 form", () => {
    const html = renderToStaticMarkup(<People seats={[seat({ owes: owing(2) })]} human="pablo" focus={null} onFocus={() => undefined} onClose={() => undefined} />);
    const ref = html.match(/aria-label="Chat with dev_ana" aria-describedby="([^"]+)"/)?.[1];
    expect(ref).toBeTruthy();
    expect(ref).not.toContain(" ");
    expect(html).toContain(`<span class="sr-only" id="${ref}">session live, mail alive, owes 2 messages, context 42%</span>`);
  });
  it("with mail waiting the same line says it after the mail word (FR-9)", () => {
    const html = renderToStaticMarkup(<People seats={[seat({ watcher: "stale", undelivered: 1, owes: owing(2) })]} human="pablo" focus={null} onFocus={() => undefined} onClose={() => undefined} />);
    expect(html).toContain(">session live, mail stale, 1 message waiting, owes 2 messages, context 42%</span>");
    expect(html).toContain("stale · 1 waiting");
  });
});

// B2 (leftovers-29 FR-6, launch-progress L12): deaf and capped draw their
// waiting count, and the description says the same count.
describe("B2: deaf and capped badges draw `· n waiting`", () => {
  const render = (over: Partial<Record<string, unknown>>) =>
    renderToStaticMarkup(<People seats={[seat({ ...over, undelivered: 3 })]} human="pablo" focus={null} onFocus={() => undefined} onClose={() => undefined} />);
  it("deaf · 3 waiting, described as 3 messages waiting", () => {
    expect(personBadge(seat({ watcher: "stale", deaf: true, undelivered: 3 }))?.words).toBe("deaf · 3 waiting");
    const html = render({ watcher: "stale", deaf: true });
    expect(html).toContain(">deaf · 3 waiting</span>");
    expect(html).toContain(`mail ${HEALTH.deaf.label}, 3 messages waiting`);
  });
  it("capped · 3 waiting, described as 3 messages waiting", () => {
    expect(personBadge(seat({ watcher: "alive", capped: true, undelivered: 3 }))?.words).toBe("capped · 3 waiting");
    const html = render({ watcher: "alive", capped: true });
    expect(html).toContain(">capped · 3 waiting</span>");
    expect(html).toContain(`mail ${HEALTH.capped.label}, 3 messages waiting`);
  });
  it("draws no count at 0, and no badge without a watcher", () => {
    expect(personBadge(seat({ watcher: "stale", deaf: true, undelivered: 0 }))?.words).toBe("deaf");
    expect(personBadge(seat({ watcher: "", undelivered: 3 }))).toBeNull();
  });
});
