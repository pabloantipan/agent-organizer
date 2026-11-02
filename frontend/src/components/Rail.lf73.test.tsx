import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import type { merge } from "../../wailsjs/go/models";

// leftovers-73 V3 (FR-4; run-report Amendment 9; design system, "A proper
// name ... never sits in an uppercased label"): a rail group a person named
// shows its name as written, at the label's size, weight and colour; the
// app's own group labels (Roles, Asleep, Archived, ungrouped) keep the label
// look, uppercase included. Also FR-3: the folded groups read `Asleep · N`,
// `Archived · N` through SecCount.
const store = vi.hoisted(() => {
  const state: Record<string, unknown> = {};
  const useBoard = Object.assign((sel?: (s: unknown) => unknown) => (sel ? sel(state) : state), {
    getState: () => state,
    setState: (p: Record<string, unknown>) => Object.assign(state, p),
  });
  return { state, useBoard };
});
vi.mock("../stores/board.store", () => ({ useBoard: store.useBoard }));
const { Rail } = await import("./Rail");
const fs: { readFileSync(p: string, enc: "utf8"): string } = await import("node:" + "fs");
const css = fs.readFileSync(new URL("../styles/global.css", import.meta.url).pathname, "utf8").replace(/\/\*[\s\S]*?\*\//g, "");

const init = (id: string, status = "active") => ({ id, title: id, client: "", machine: "m1", local: true, status, now: 0, blocked: 0, next: 1, live: 0, working: 0 });
function rail(): string {
  store.useBoard.setState({
    view: {
      board: { initiatives: [init("a"), init("b"), init("c"), init("nap", "paused"), init("old", "archived")] as unknown as merge.BoardInitiative[], columns: {} },
      order: { groups: [{ name: "acme", initiatives: ["a"] }, { name: "ACME Ops", initiatives: ["b"] }] },
    },
    agents: { groups: [], roles: [{ name: "talos", here: true }, { name: "hermione", here: true }] },
    selectedInitiative: null, setSelectedInitiative: () => undefined, reorderInitiatives: () => undefined,
    setGroups: () => undefined, railCollapsed: false, setRailCollapsed: () => undefined, roleOpen: null,
    openInitiatives: () => undefined, screen: "home",
  });
  return renderToStaticMarkup(<Rail />);
}
/** The declarations of the rule whose selector list is exactly `sel`. */
function rule(sel: string): string {
  const esc = sel.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const m = new RegExp(String.raw`(?:^|\n)` + esc + String.raw` \{([^}]*)\}`).exec(css);
  expect(m, `rule ${sel}`).not.toBeNull();
  return m![1];
}
const heads = (html: string) => [...html.matchAll(/<div class="rail-group-head( fixed)? ?"[^>]*>(.*?)<\/div>/g)];
const nameOf = (head: string) => /<span class="(rail-group-name[^"]*)"[^>]*>([^<]*)<\/span>/.exec(head);

describe("leftovers-73 V3 (FR-4): a group a person named reads as written", () => {
  const html = rail();
  it("draws `acme` and `ACME Ops` as written, in a head that is not the app's label", () => {
    const named = heads(html).filter((h) => !h[1]).map((h) => nameOf(h[2]));
    expect(named.map((n) => n && n[2])).toEqual(["acme", "ACME Ops"]);
    for (const n of named) expect(n![1]).toBe("rail-group-name");
  });
  it("no rule uppercases `.rail-group-name` itself; it keeps the label's size, weight and colour", () => {
    const own = rule(".rail-group-name");
    expect(own).not.toMatch(/text-transform/);
    expect(own).toMatch(/font-size: var\(--font-size-xs\)/);
    expect(own).toMatch(/font-weight: 600/);
    expect(own).toMatch(/color: var\(--muted\)/);
    const anyUpper = [...css.matchAll(/([^{}]+)\{([^}]*text-transform: uppercase[^}]*)\}/g)].map((m) => m[1].trim()).filter((s) => s.includes("rail-group-name"));
    expect(anyUpper).toEqual([".rail-group-head.fixed .rail-group-name"]);
  });
  it("keeps the label look on the app's own labels: Roles, ungrouped, Asleep, Archived", () => {
    expect(rule(".rail-group-head.fixed .rail-group-name")).toMatch(/text-transform: uppercase/);
    const fixed = heads(html).filter((h) => h[1]).map((h) => nameOf(h[2])![2]);
    expect(fixed).toEqual(["Roles", "ungrouped", "Asleep", "Archived"]);
  });
});

describe("leftovers-73 V3 (FR-3, AR38): the folded groups read `<word> · N` through SecCount", () => {
  it("Asleep · 1 and Archived · 1, with no (N)", () => {
    const html = rail();
    const text = (sel: string) => {
      const sec = new RegExp(`<section class="rail-group folded" aria-label="${sel}">.*?</section>`).exec(html)![0];
      return /<span class="rail-group-title">(.*?)<\/span><span class="spacer"|<span class="rail-group-title">(.*?)<\/span><\/div>/.exec(sec)!.slice(1).find(Boolean)!.replace(/<[^>]+>/g, "");
    };
    expect(text("Asleep")).toBe("Asleep · 1");
    expect(text("Archived")).toBe("Archived · 1");
    expect(html).not.toMatch(/\(\d+\)/);
    expect(html).toContain('<span class="num rail-group-n">1</span>');
  });
});
