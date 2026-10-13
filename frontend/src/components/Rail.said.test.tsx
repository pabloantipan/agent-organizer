import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import type { merge } from "../../wailsjs/go/models";
import { heroSaid, RailHero } from "./Rail";

// zustand answers a server render with the store's initial state, so the
// store is a plain object here that the tests set (as InitiativesView.test).
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

const init = (id: string, now: number, blocked: number, next: number) =>
  ({ id, title: id, client: "", machine: "m", local: true, status: "active", now, blocked, next, live: 0, working: 0 }) as unknown as merge.BoardInitiative;

function rail(selected: string | null, groups: { name: string; initiatives: string[] }[] = []) {
  store.useBoard.setState({
    view: { board: { initiatives: [init("a", 1, 0, 2), init("b", 2, 1, 0), init("c", 0, 0, 3)], columns: {} }, order: { groups } },
    agents: null, selectedInitiative: selected, setSelectedInitiative: () => undefined, reorderInitiatives: () => undefined,
    setGroups: () => undefined, railCollapsed: false, setRailCollapsed: () => undefined, roleOpen: null,
    openInitiatives: () => undefined, screen: selected ? "initiative" : "home",
  });
  return renderToStaticMarkup(<Rail />);
}

describe("V2: the hero's counts are one spoken line (FR-7, I40)", () => {
  const hero = { eyebrow: "acme", name: "init-a", now: 3, blocked: 0, next: 5 };

  for (const [where, back] of [["on an initiative", true], ["on Home", false]] as const) {
    it(`${where}: the stats are aria-hidden and one visually hidden line says them`, () => {
      const html = renderToStaticMarkup(<RailHero hero={hero} back={back} onBack={() => undefined} />);
      expect(html).toContain('<div class="stats" aria-hidden="true">');
      expect(html.match(/class="sr-only"/g)).toHaveLength(1);
      expect(html).toContain('<span class="sr-only">3 now, 0 blocked, 5 next</span>');
      // inside the hero's box, after the stats
      expect(html.indexOf("sr-only")).toBeGreaterThan(html.indexOf('class="stats"'));
      expect(html.endsWith("</span></div>")).toBe(true);
      expect(html).not.toMatch(/<div[^>]*aria-label=/);
    });
  }

  it("Home's hero says the active totals from the rail", () => {
    const html = rail(null);
    expect(html).toContain(`<span class="sr-only">${heroSaid({ now: 3, blocked: 1, next: 5 })}</span>`);
    expect(rail("b")).toContain('<span class="sr-only">2 now, 1 blocked, 0 next</span>');
  });
});
