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
const fs: { readFileSync(p: URL, enc: "utf8"): string } = await import("node:" + "fs");

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
  it("says how many and that they are sent again when they change (leftovers-69 FR-7 words)", () => {
    expect(text(section(draw(JSON.parse(wire)))!)).toContain("Not accepted · 2");
    const one = JSON.parse(wire);
    one.rejected = one.rejected.slice(1);
    expect(text(section(draw(one))!)).toContain("Not accepted · 1");
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

// leftovers-67 V5 (FR-12; usage Amendment 1, U9) as leftovers-69 V3
// amends it (FR-7; usage Amendment 2, U9 amended): the title is
// `Not accepted · N`, uppercased by .sec-title as every section title, and
// the system's name moves to the line under it, in its own case.
describe("leftovers-69 V3 (FR-7, U9 amended): the title is Not accepted · N; the line names discuss-record in its own case", () => {
  beforeEach(() => { h.n = 0; });
  it("over two rows: the title `Not accepted · 2`, then the line, above the rows", () => {
    const s = section(draw(JSON.parse(wire)))!;
    const title = /<h2 id="usage-rejected-title" class="sec-title">([\s\S]*?)<\/h2>/.exec(s)!;
    expect(text(title[1])).toBe("Not accepted · 2");
    const line = /<p class="usage-rejected-why">([^<]*)<\/p>/.exec(s)!;
    expect(line[1]).toBe("discuss-record did not take these. Sent again when its usage changes. Nothing for you to do; the reason is for the FSE.");
    expect(s.indexOf("</h2>")).toBeLessThan(s.indexOf("usage-rejected-why"));
    expect(s.indexOf("usage-rejected-why")).toBeLessThan(s.indexOf("<table"));
    expect(rowsOf(s)).toHaveLength(2);
    expect(text(s)).not.toMatch(/the record|not resent/);
  });
  it("no rule uppercases or capitalizes the line, so discuss-record keeps its own case", () => {
    const css = fs.readFileSync(new URL("../styles/usage.css", import.meta.url), "utf8");
    const rules = [...css.matchAll(/([^{}]*usage-rejected-why[^{}]*)\{([^}]*)\}/g)];
    expect(rules.length).toBeGreaterThan(0);
    for (const r of rules) expect(r[2]).not.toMatch(/text-transform|font-variant-caps/);
    expect(css).not.toMatch(/usage-rejected-why::first-letter/);
  });
  it("draws the line sm and muted", () => {
    const css = fs.readFileSync(new URL("../styles/usage.css", import.meta.url), "utf8");
    const r = /\n\.usage-rejected-why \{([^}]*)\}/.exec(css)![1];
    expect(r).toContain("font-size: var(--font-size-sm)");
    expect(r).toContain("color: var(--fg-muted)");
  });
});

// leftovers-70 V2 (FR-2; usage Amendment 3, U10): `.sec-title` is a flex
// row with a gap (shell.css), so a bare text node `Not accepted · ` and the
// count's span were two flex items: the trailing space collapsed and the
// gap stood in for it, wider than the space before the dot. The phrase and
// its count are one item, so the spaces each side of the `·` are spaces.
describe("leftovers-70 V2 (FR-2, U10): the title is one phrase, one space each side of the dot", () => {
  beforeEach(() => { h.n = 0; });
  it("over two rows: `Not accepted · 2` with single spaces, title and count in one flex item", () => {
    const s = section(draw(JSON.parse(wire)))!;
    const inner = /<h2 id="usage-rejected-title" class="sec-title">([\s\S]*?)<\/h2>/.exec(s)![1];
    // One child of the flex row: nothing before or after the one element.
    const one = /^<span>([\s\S]*)<\/span>$/.exec(inner);
    expect(one, inner).not.toBeNull();
    expect(one![1].replace(/<[^>]*>/g, "")).toBe("Not accepted · 2");
    expect(one![1]).toBe('Not accepted · <span class="num sec-count">2</span>');
  });
});
