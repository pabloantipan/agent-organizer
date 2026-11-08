import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import type { merge } from "../../wailsjs/go/models";

// leftovers-74 V3 (FR-2, AR40): a stored group `other` (what the old "Group
// by client" seed wrote) reads `Other`, the app's label; `misc` reads as
// stored. V4 (FR-3): the folds' doc comments read `Asleep · n`, `Archived · n`;
// no fold word followed by a parenthesised n is left in the sources.
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
const fs: { readFileSync(p: string, enc: "utf8"): string; readdirSync(p: string, o: { recursive: true }): string[] } = await import("node:" + "fs");

const init = (id: string, client = "") => ({ id, title: id, client, machine: "m1", local: true, status: "active", now: 0, blocked: 0, next: 1, live: 0, working: 0 });
function rail(groups: { name: string; initiatives: string[] }[]): string {
  store.useBoard.setState({
    view: {
      board: { initiatives: [init("a"), init("b"), init("c", "acme")] as unknown as merge.BoardInitiative[], columns: {} },
      order: { groups },
    },
    agents: { groups: [], roles: [] },
    selectedInitiative: null, setSelectedInitiative: () => undefined, reorderInitiatives: () => undefined,
    setGroups: () => undefined, railCollapsed: false, setRailCollapsed: () => undefined, roleOpen: null,
    openInitiatives: () => undefined, screen: "home",
  });
  return renderToStaticMarkup(<Rail />);
}
const names = (html: string) => [...html.matchAll(/<span class="rail-group-name"[^>]*>([^<]*)<\/span>/g)].map((m) => m[1]);

describe("leftovers-74 V3 (FR-2, AR40): the rail reads a stored `other` as Other", () => {
  it("draws `Other` for a stored `other` and `misc` as stored", () => {
    expect(names(rail([{ name: "other", initiatives: ["a"] }, { name: "misc", initiatives: ["b"] }, { name: "Acme", initiatives: ["c"] }]))).toEqual(["Other", "misc", "Acme"]);
  });
  it("names the group's fold and actions by what it shows", () => {
    const html = rail([{ name: "other", initiatives: ["a"] }, { name: "misc", initiatives: ["b", "c"] }]);
    expect(html).toMatch(/aria-label="[^"]*Other"/);
    expect(html).not.toMatch(/aria-label="[^"]*\bother"/);
  });
});

describe("leftovers-74 V4 (FR-3): the folds are written `Asleep · n` and `Archived · n` everywhere", () => {
  it("finds no fold word followed by a parenthesised n in the frontend sources", () => {
    const root = new URL("..", import.meta.url).pathname;
    const hits: string[] = [];
    for (const f of fs.readdirSync(root, { recursive: true })) {
      if (!/\.(ts|tsx)$/.test(f)) continue;
      fs.readFileSync(root + f, "utf8").split("\n").forEach((l, i) => { if (/(Asleep|Archived) \(n\)/.test(l)) hits.push(`${f}:${i + 1}`); });
    }
    expect(hits).toEqual([]);
  });
});
