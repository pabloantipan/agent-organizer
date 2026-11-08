import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import type { BoardView } from "../hooks/useWails";
import type { merge } from "../../wailsjs/go/models";
import { floatList, type FloatRow } from "../lib/floatList";

// leftovers-78 (FR-1, FR-2; run-report Amendment 12, AR43): the rail and the
// float list read the seed as `Initiatives with no client` beside a client
// group called `No client`; a refused rename keeps the field open with the
// typed text and one line under it in a live region.
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
const { FloatSections, labelGroups } = await import("./FloatList");
const { railGroupLabel, takenBy, takenLine, renameGroup } = await import("../lib/railGroup");

const init = (id: string, client = "") => ({ id, title: id, client, machine: "m1", local: true, status: "active", now: 0, blocked: 0, next: 1, live: 0, working: 0, goal: "", decisions: [] });
const initiatives = [init("a"), init("b", "No client"), init("c", "acme")] as unknown as merge.BoardInitiative[];
type G = { name: string; seed?: string; initiatives: string[] };
function rail(groups: G[]): string {
  store.useBoard.setState({
    view: { board: { initiatives, columns: {} }, order: { groups } },
    agents: { groups: [], roles: [] },
    selectedInitiative: null, setSelectedInitiative: () => undefined, reorderInitiatives: () => undefined,
    setGroups: () => undefined, railCollapsed: false, setRailCollapsed: () => undefined, roleOpen: null,
    openInitiatives: () => undefined, screen: "home",
  });
  return renderToStaticMarkup(<Rail />);
}
const names = (html: string) => [...html.matchAll(/<span class="rail-group-name"[^>]*>([^<]*)<\/span>/g)].map((m) => m[1]);
const beside: G[] = [{ name: "", seed: "no-client", initiatives: ["a"] }, { name: "No client", initiatives: ["b"] }, { name: "acme", initiatives: ["c"] }];

describe("leftovers-78 V1 (FR-1, AR43): the rail and the float list never show two groups alike", () => {
  it("draws `Initiatives with no client` for the seed beside a client No client, names included", () => {
    const html = rail(beside);
    expect(names(html)).toEqual(["Initiatives with no client", "No client", "acme"]);
    expect(html).toContain('aria-label="Collapse Initiatives with no client"');
    expect(html).toContain('aria-label="Actions for Initiatives with no client"');
    expect(html).toContain('aria-label="Actions for No client"');
  });
  it("draws `No client` for the seed beside misc", () => {
    expect(names(rail([{ name: "", seed: "no-client", initiatives: ["a"] }, { name: "misc", initiatives: ["b", "c"] }]))).toEqual(["No client", "misc"]);
  });
  it("labels the float list's sections the same way, text and accessible name", () => {
    const view = { board: { initiatives, columns: {} }, order: { groups: beside, resolved: {} } } as unknown as BoardView;
    const row = (r: FloatRow) => <span key={r.id}>{r.id}</span>;
    const html = renderToStaticMarkup(<FloatSections sections={floatList(labelGroups(view), null).sections} row={row} />);
    expect([...html.matchAll(/<div class="fl-group">([^<]*)<\/div>/g)].map((m) => m[1])).toEqual(["Initiatives with no client", "No client", "acme"]);
    expect(html).toContain('role="group" aria-label="Initiatives with no client"');
    expect(beside[0].name).toBe("");
  });
});

describe("leftovers-78 V5 (FR-2, AR43): the rename field after a refusal", () => {
  it("stays open on the typed text with the line in a live region, nothing written", () => {
    const groups: G[] = [{ name: "misc", initiatives: ["a"] }, { name: "acme", initiatives: ["c"] }];
    const typed = " ACME ";
    const taken = takenBy(groups, 0, typed)!;
    expect(renameGroup(groups, 0, typed)).toBeNull();
    const html = renderToStaticMarkup(<RenameField name={railGroupLabel(groups[0], groups)} refused={{ line: takenLine(taken, "misc"), text: typed }} onDone={() => undefined} onCancel={() => undefined} />);
    expect(html).toContain('value=" ACME "');
    expect(html).toContain('aria-label="Rename misc"');
    expect(html).toContain('aria-invalid="true"');
    const line = html.match(/<span id="([^"]+)" class="rail-rename-line">([^<]*)<\/span>/);
    expect(line?.[2]).toBe("A group is already called acme. Type another name, or press Escape to keep misc.");
    expect(html).toContain(`aria-describedby="${line?.[1]}"`);
  });
  it("draws an empty, silent line before any refusal", () => {
    const html = renderToStaticMarkup(<RenameField name="misc" onDone={() => undefined} onCancel={() => undefined} />);
    expect(html).toContain('value="misc"');
    expect(html).not.toContain("aria-invalid");
    expect(html).toMatch(/class="rail-rename-line"><\/span>/);
  });
});
