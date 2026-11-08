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
