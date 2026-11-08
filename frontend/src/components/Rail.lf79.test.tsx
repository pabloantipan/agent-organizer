import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

// leftovers-79 (run-report Amendment 13; design system, "Refused field"): a
// refused group rename is marked while the field holds the refused text
// (FR-1, AR46). There is no DOM test library: the field staying open and
// Escape closing it are the UI rows.
const store = vi.hoisted(() => {
  const state: Record<string, unknown> = {};
  const useBoard = Object.assign((sel?: (s: unknown) => unknown) => (sel ? sel(state) : state), {
    getState: () => state,
    setState: (p: Record<string, unknown>) => Object.assign(state, p),
  });
  return { state, useBoard };
});
vi.mock("../stores/board.store", () => ({ useBoard: store.useBoard }));
const { RenameField, holdsRefused } = await import("./Rail");
const { takenLine } = await import("../lib/railGroup");
const fs: { readFileSync(p: string, enc: "utf8"): string } = await import("node:" + "fs");
const read = (f: string) => fs.readFileSync(new URL(`../styles/${f}`, import.meta.url).pathname, "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
const css = read("global.css");

/** The declarations of the rule whose selector list is exactly `sel`. */
function rule(sheet: string, sel: string): string {
  const esc = sel.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return sheet.match(new RegExp(`(?:^|})\\s*${esc}\\s*\\{([^}]*)\\}`))?.[1] ?? "";
}

const refused = { line: takenLine("No client", "misc"), text: "no client" };

describe("leftovers-79 V1 (FR-1, AR46): the refused field is marked while it holds the refused text", () => {
  it("draws a 2px --status-blocked border on the field's aria-invalid rule", () => {
    const r = rule(css, '.rail-group-name-input[aria-invalid="true"]');
    expect(r).toMatch(/border:\s*2px solid var\(--status-blocked\)/);
    // Tier-2 tokens only, Safari 15.0: no oklch, color-mix.
    expect(r).not.toMatch(/oklch|color-mix/);
  });
  it("outranks the focused input's border (the refused field keeps focus)", () => {
    // `input:focus` is (0,1,1); the refused rule is (0,2,0), so it wins focused.
    expect(rule(css, "input:focus, textarea:focus")).toMatch(/border-color/);
    expect(css).not.toMatch(/\.rail-group-name-input[^{,]*:focus[^{]*\{[^}]*border/);
  });
  it("is aria-invalid while the field holds the refused text, and not once anything is typed", () => {
    expect(holdsRefused(refused, "no client")).toBe(true);
    expect(holdsRefused(refused, "no clientx")).toBe(false);
    expect(holdsRefused(refused, "no clien")).toBe(false);
    expect(holdsRefused(null, "no client")).toBe(false);
    expect(holdsRefused(undefined, "misc")).toBe(false);
  });
  it("renders the refused field aria-invalid with the line, and the field before a refusal without it", () => {
    const html = renderToStaticMarkup(<RenameField name="misc" refused={refused} onDone={() => undefined} onCancel={() => undefined} />);
    expect(html).toContain('aria-invalid="true"');
    expect(html).toContain('value="no client"');
    expect(html).toContain("A group is already called No client. Type another name, or press Escape to keep misc.");
    const before = renderToStaticMarkup(<RenameField name="misc" onDone={() => undefined} onCancel={() => undefined} />);
    expect(before).not.toContain("aria-invalid");
  });
});

// leftovers-79 V3 (FR-3, AR48): the visible line is plain text; the
// announcement is a separate sr-only live region, always in the DOM and never
// display: none, emptied and set again 100 ms later on every refusal.
const { Rail } = await import("./Rail");
const { SAY_GAP_MS, speaker } = await import("../lib/liveRegion");
const shell = read("shell.css");
const init = (id: string, client = "") => ({ id, title: id, client, machine: "m1", local: true, status: "active", now: 0, blocked: 0, next: 1, live: 0, working: 0, goal: "", decisions: [] });
function rail(railCollapsed: boolean): string {
  store.useBoard.setState({
    view: { board: { initiatives: [init("a"), init("b", "acme")], columns: {} }, order: { groups: [{ name: "misc", initiatives: ["a"] }, { name: "acme", initiatives: ["b"] }] } },
    agents: { groups: [], roles: [] },
    selectedInitiative: null, setSelectedInitiative: () => undefined, reorderInitiatives: () => undefined,
    setGroups: () => undefined, railCollapsed, setRailCollapsed: () => undefined, roleOpen: null,
    openInitiatives: () => undefined, screen: "home",
  });
  return renderToStaticMarkup(<Rail />);
}
const REGION = /<span class="sr-only rail-said" role="alert" aria-live="assertive" aria-atomic="true">([^<]*)<\/span>/;

describe("leftovers-79 V3 (FR-3, AR48): every refusal is announced, the same one again", () => {
  it("empties then sets the region, twice, for two identical refusals (fake timers)", () => {
    vi.useFakeTimers();
    try {
      const line = takenLine("acme", "misc");
      const region: string[] = [];
      const { say } = speaker((m) => region.push(m));
      say(line);
      expect(region).toEqual([""]);
      vi.advanceTimersByTime(SAY_GAP_MS - 1);
      expect(region).toEqual([""]);
      vi.advanceTimersByTime(1);
      expect(region).toEqual(["", line]);
      say(line);
      expect(region).toEqual(["", line, ""]);
      vi.advanceTimersByTime(SAY_GAP_MS);
      expect(region).toEqual(["", line, "", line]);
      expect(SAY_GAP_MS).toBe(100);
    } finally { vi.useRealTimers(); }
  });
  it("draws the region in the rail before any refusal, expanded and as a strip", () => {
    for (const collapsed of [false, true]) {
      const html = rail(collapsed);
      expect(html.match(REGION)?.[1]).toBe("");
      expect(html.match(new RegExp(REGION.source, "g"))).toHaveLength(1);
    }
  });
  it("never hides the region with display: none", () => {
    for (const sheet of [css, shell]) {
      for (const m of sheet.matchAll(/([^{}]+)\{([^}]*)\}/g)) {
        if (/\.sr-only\b|\.rail-said\b/.test(m[1])) expect(m[2]).not.toMatch(/display:\s*none/);
      }
    }
    expect(rule(shell, ".sr-only")).toMatch(/position: absolute/);
  });
  it("keeps the visible line plain text: no role, no aria-live", () => {
    const html = renderToStaticMarkup(<RenameField name="misc" refused={refused} onDone={() => undefined} onCancel={() => undefined} />);
    const line = html.match(/<span id="[^"]+" class="rail-rename-line"([^>]*)>/);
    expect(line).not.toBeNull();
    expect(line![1]).toBe("");
  });
});
