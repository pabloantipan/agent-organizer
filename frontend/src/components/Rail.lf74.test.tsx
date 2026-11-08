import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import type { merge } from "../../wailsjs/go/models";

// leftovers-77 (FR-2, FR-3; was leftovers-74 V3): the seeded group with an
// empty name reads `No client`; a stored `other` is a person's name now and
// reads as stored, like `misc`. V4 (FR-3 of leftovers-74): the folds' doc
// comments read `Asleep · n`, `Archived · n`; no fold word followed by a
// parenthesised n is left in the sources.
const store = vi.hoisted(() => {
  const state: Record<string, unknown> = {};
  const useBoard = Object.assign((sel?: (s: unknown) => unknown) => (sel ? sel(state) : state), {
    getState: () => state,
    setState: (p: Record<string, unknown>) => Object.assign(state, p),
  });
  return { state, useBoard };
});
vi.mock("../stores/board.store", () => ({ useBoard: store.useBoard }));
const { Rail, RenameField } = await import("./Rail");
const { railGroupLabel } = await import("../lib/railGroup");
const fs: { readFileSync(p: string, enc: "utf8"): string; readdirSync(p: string, o: { recursive: true }): string[] } = await import("node:" + "fs");

const init = (id: string, client = "") => ({ id, title: id, client, machine: "m1", local: true, status: "active", now: 0, blocked: 0, next: 1, live: 0, working: 0 });
function rail(groups: { name: string; seed?: string; initiatives: string[] }[]): string {
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

describe("leftovers-77 V3 (FR-2, FR-3, AR40, AR41): the rail reads the seed as No client", () => {
  it("draws `No client` for the seed, `other` and `misc` as stored", () => {
    expect(names(rail([{ name: "", seed: "no-client", initiatives: ["a"] }, { name: "other", initiatives: ["b"] }, { name: "misc", initiatives: ["c"] }]))).toEqual(["No client", "other", "misc"]);
  });
  it("names the seed's fold and actions by what it shows", () => {
    const html = rail([{ name: "", seed: "no-client", initiatives: ["a"] }, { name: "misc", initiatives: ["b", "c"] }]);
    expect(html).toContain('aria-label="Collapse No client"');
    expect(html).toContain('aria-label="Actions for No client"');
  });
  it("opens the seed's rename field on `No client`, named `Rename No client`", () => {
    const html = renderToStaticMarkup(<RenameField name={railGroupLabel({ name: "", seed: "no-client" })} onDone={() => undefined} onCancel={() => undefined} />);
    expect(html).toContain('value="No client"');
    expect(html).toContain('aria-label="Rename No client"');
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
