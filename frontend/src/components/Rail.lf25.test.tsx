import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import type { merge } from "../../wailsjs/go/models";
import { groupMenu, menuPlace, RenameField, rowName } from "./Rail";

// leftovers-25 FR-6 to FR-9 (tab-reaches-links Amendment 2 §1, §4, §7-§9).
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

const base = { id: "x", client: "", now: 0, blocked: 0, next: 1 };
const defining = { state: "in_definition" };

describe("R1: a rail row says what it draws, after the counts (FR-6)", () => {
  it("appends cell in definition, the live agents and the machines, in that order", () => {
    expect(rowName({ ...base, cell: defining, live: 1, machines: ["m1", "m2"] }, 2))
      .toBe("x, rank 2, 0 now, 0 blocked, 1 next, cell in definition, 1 live agent, 2 machines");
    expect(rowName({ ...base, live: 2 }, 2)).toBe("x, rank 2, 0 now, 0 blocked, 1 next, 2 live agents");
    expect(rowName({ ...base, machines: ["m1", "m2"] }, 2)).toBe("x, rank 2, 0 now, 0 blocked, 1 next, 2 machines");
  });

  it("says nothing it does not draw: no cell, a cell out of definition, no agent, one machine", () => {
    expect(rowName({ ...base, cell: { state: "running" }, live: 0, machines: ["m1"] }, 2)).toBe("x, rank 2, 0 now, 0 blocked, 1 next");
    expect(rowName({ ...base, cell: null }, 2)).toBe("x, rank 2, 0 now, 0 blocked, 1 next");
  });

  it("the full row and the strip carry the same name", () => {
    const inits = [
      { id: "a", title: "a", client: "acme", machine: "m1", local: true, status: "active", now: 1, blocked: 0, next: 0, live: 2, working: 0 },
      { id: "a", title: "a", client: "acme", machine: "m2", local: false, status: "active", now: 0, blocked: 0, next: 0, live: 0, working: 0 },
    ] as unknown as merge.BoardInitiative[];
    const name = "a, acme, rank 1, 1 now, 0 blocked, 0 next, cell in definition, 2 live agents, 2 machines";
    for (const strip of [false, true]) {
      store.useBoard.setState({
        view: { board: { initiatives: inits, columns: {} }, order: { groups: [] } },
        agents: { groups: [{ id: "a", cell: { state: "in_definition", project: "a" }, crew: [] }], roles: [] },
        selectedInitiative: null, setSelectedInitiative: () => undefined, reorderInitiatives: () => undefined,
        setGroups: () => undefined, railCollapsed: strip, setRailCollapsed: () => undefined, roleOpen: null,
        openInitiatives: () => undefined, screen: "home",
      });
      expect(renderToStaticMarkup(<Rail />)).toContain(`aria-label="${name}"`);
    }
  });
});

describe("R3: the group menu holds what can act and fits its view (FR-8)", () => {
  it("leaves out Move up on the first group and Move down on the last", () => {
    expect(groupMenu(0, 3)).toEqual(["Rename", "Move down", "Remove"]);
    expect(groupMenu(1, 3)).toEqual(["Rename", "Move up", "Move down", "Remove"]);
    expect(groupMenu(2, 3)).toEqual(["Rename", "Move up", "Remove"]);
    expect(groupMenu(0, 1)).toEqual(["Rename", "Remove"]);
  });

  it("opens downward with room, upward when the room below is short, never past the edge", () => {
    expect(menuPlace(100, 120, 140, 640)).toEqual({ up: false, room: 518 });
    expect(menuPlace(560, 580, 140, 640)).toEqual({ up: true, room: 558 });
    // short on both sides: the larger one, its height the menu's ceiling
    expect(menuPlace(60, 80, 140, 160)).toEqual({ up: false, room: 78 });
    expect(menuPlace(90, 110, 140, 160)).toEqual({ up: true, room: 88 });
  });
});

describe("R4: the rename field is named (FR-9)", () => {
  it("is `Rename <group>`", () => {
    const html = renderToStaticMarkup(<RenameField name="clients" onDone={() => undefined} onCancel={() => undefined} />);
    expect(html).toMatch(/<input[^>]*aria-label="Rename clients"/);
  });
});
