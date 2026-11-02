import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

// leftovers-62 U3 (FR-7): the Usage view lists the rows the record refused,
// each with its session, day and reason, from FR-3's JSON (`organizer usage
// --json`, App.Usage: `rejected: [{session_id, day, reason}]`, oldest day
// first, never null). Vitest runs in Node with no DOM, so the view is drawn
// by a server render whose `useState` calls are seeded by position, as
// Busy.after.test does: Usage's second state is the data App.Usage answered.

const h = vi.hoisted(() => ({ n: 0, seeds: new Map<number, unknown>(), state: {} as Record<string, unknown> }));

vi.mock("react", async (orig) => {
  const R = await orig<typeof import("react")>();
  function useState<T>(init: T | (() => T)) {
    const [v, set] = R.useState(init);
    const i = h.n++;
    return [h.seeds.has(i) ? (h.seeds.get(i) as T) : v, set] as const;
  }
  return { ...R, default: { ...R, useState }, useState };
});
vi.mock("../../wailsjs/go/main/App", () => ({ Usage: () => new Promise(() => undefined) }));
vi.mock("../stores/board.store", () => {
  const useBoard = Object.assign((sel?: (s: unknown) => unknown) => (sel ? sel(h.state) : h.state), { getState: () => h.state });
  return { useBoard };
});

const { Usage } = await import("./Usage");

const zero = { input: 0, output: 0, cache_read: 0, cache_write: 0 };
const totals = (week: string, start: string, end: string, money: number, sessions: number) =>
  ({ ...zero, input: 1200, output: 300, week, start, end, money, tokens: 1500, sessions, hours: 1.5, running: 0, without_cost: 0 });

/** FR-3's JSON as the wire carries it: the week of 2026-10-05 with one
 *  session, and the two rows the record refused. */
const wire = JSON.stringify({
  machine: "lodestar",
  week: "2026-W41",
  this_week: totals("2026-W41", "2026-10-05", "2026-10-11", 1.25, 1),
  last_week: totals("2026-W40", "2026-09-28", "2026-10-04", 0, 0),
  first_day: "2026-10-04",
  history: [{ week: "2026-W41", start: "2026-10-05", money: 1.25, tokens: 1500, sessions: 1 }],
  weeks: [{ week: "2026-W41", start: "2026-10-05", money: 1.25, tokens: 1500, sessions: 1 }],
  cuts: { initiative: [], role: [], task: [], model: [] },
  sessions: [],
  stats: {},
  rejected: [
    { session_id: "s-gone-later", day: "2026-10-04", reason: "input is a JSON string" },
    { session_id: "s-neg", day: "2026-10-05", reason: "token counts and messages cannot be negative" },
  ],
});

function draw(data: unknown) {
  h.n = 0;
  h.seeds.clear();
  h.seeds.set(1, data);
  Object.keys(h.state).forEach((k) => delete h.state[k]);
  Object.assign(h.state, { usageFilter: null, setUsageFilter: () => undefined, view: { board: { machines: ["lodestar"], columns: {} } }, select: () => undefined });
  return renderToStaticMarkup(<Usage />);
}
const section = (html: string) => /<section class="usage-sec usage-rejected"[\s\S]*?<\/section>/.exec(html)?.[0] ?? null;
const rowsOf = (html: string) =>
  [...html.matchAll(/<tr><th scope="row"[^>]*><span[^>]*>([^<]*)<\/span><\/th><td[^>]*>([^<]*)<\/td><td>([^<]*)<\/td><\/tr>/g)].map((m) => [m[1], m[2], m[3]]);
const text = (html: string) => html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();

describe("leftovers-62 U3: the Usage view lists the rejected rows", () => {
  beforeEach(() => { h.n = 0; });
  it("lists each rejected row with its session, day and reason, oldest day first", () => {
    const s = section(draw(JSON.parse(wire)));
    expect(s).not.toBeNull();
    expect(rowsOf(s!)).toEqual([
      ["s-gone-later", "2026-10-04", "input is a JSON string"],
      ["s-neg", "2026-10-05", "token counts and messages cannot be negative"],
    ]);
  });
  it("says how many and that they are not resent until they change", () => {
    expect(text(section(draw(JSON.parse(wire)))!)).toContain("Rejected by the record · 2 not resent until they change");
    const one = JSON.parse(wire);
    one.rejected = one.rejected.slice(1);
    expect(text(section(draw(one))!)).toContain("Rejected by the record · 1 not resent until it changes");
  });
  it("is the view's, under the week, whatever the week holds", () => {
    const html = draw(JSON.parse(wire));
    expect(html.indexOf("usage-rejected")).toBeGreaterThan(html.indexOf("usage-tiles"));
  });
  it("draws nothing when the record refused nothing (empty, or an older answer without the field)", () => {
    const none = JSON.parse(wire);
    none.rejected = [];
    expect(section(draw(none))).toBeNull();
    delete none.rejected;
    expect(section(draw(none))).toBeNull();
  });
});
