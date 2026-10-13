import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import type { Seat } from "../hooks/useWails";
import { HEALTH } from "../lib/health";

// The store is a plain object here (as Rail.said.test): People reads none of
// it, but SlackView's module imports it.
vi.mock("../stores/board.store", () => ({ useBoard: Object.assign(() => ({}), { getState: () => ({}), setState: () => undefined }) }));
const { People, personFacts } = await import("./SlackView");

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

describe("W1: a person row names its one description (AX shape, server render)", () => {
  it("aria-describedby points at one sr-only line holding the FR-4 form", () => {
    const html = renderToStaticMarkup(<People seats={[seat({ owes: owing(2) })]} human="pablo" focus={null} onFocus={() => undefined} onClose={() => undefined} />);
    const ref = html.match(/aria-label="Chat with dev_ana" aria-describedby="([^"]+)"/)?.[1];
    expect(ref).toBeTruthy();
    expect(ref).not.toContain(" ");
    expect(html).toContain(`<span class="sr-only" id="${ref}">session live, mail alive, owes 2 messages, context 42%</span>`);
  });
});
