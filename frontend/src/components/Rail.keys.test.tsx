import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import type { merge } from "../../wailsjs/go/models";
import { groupActionOff, GroupActions, rovingMove, rovingStops, rowName } from "./Rail";

// leftovers-24 FR-6 to FR-9 (tab-reaches-links Amendment 1 §4, T8-T11).
// zustand answers a server render with the store's initial state, so the
// store is a plain object here that the tests set (as Rail.roving.test).
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

const init = (id: string, client: string, now: number, blocked: number, next: number) =>
  ({ id, title: id, client, machine: "m", local: true, status: "active", now, blocked, next, live: 0, working: 0 }) as unknown as merge.BoardInitiative;
const role = (name: string) => ({ name, here: true, state: "not_running", mail: [] });

type Opts = { groups?: { name: string; initiatives: string[] }[]; more?: number; roles?: number; strip?: boolean; selected?: string | null };
function rail({ groups = [], more = 0, roles = 1, strip = false, selected = null }: Opts = {}) {
  const inits = [init("a", "acme", 1, 0, 2), init("b", "", 2, 1, 0), init("c", "acme", 0, 0, 3)];
  for (let i = 0; i < more; i++) inits.push(init(`z${i}`, "", 0, 0, 0));
  store.useBoard.setState({
    view: { board: { initiatives: inits, columns: {} }, order: { groups } },
    agents: { groups: [], roles: Array.from({ length: roles }, (_, i) => role(`Role${i}`)) },
    selectedInitiative: selected, setSelectedInitiative: () => undefined, reorderInitiatives: () => undefined,
    setGroups: () => undefined, railCollapsed: strip, setRailCollapsed: () => undefined, roleOpen: null,
    openInitiatives: () => undefined, screen: selected ? "initiative" : "home",
  });
  return renderToStaticMarkup(<Rail />);
}

/** The rail's Tab stops in DOM order: every button, input or link not at
 *  tabindex -1, and every other element at tabindex 0. */
function tabStops(html: string): string[] {
  const nav = html.slice(0, html.indexOf("</nav>"));
  return [...nav.matchAll(/<(button|input|a|div|span)\b[^>]*>/g)]
    .filter((m) => {
      const t = /tabindex="(-?\d+)"/.exec(m[0])?.[1];
      const native = m[1] === "button" || m[1] === "input" || m[1] === "a";
      return native ? t !== "-1" && !/ disabled=""/.test(m[0]) : t === "0";
    })
    .map((m) => /aria-label="([^"]*)"/.exec(m[0])?.[1] ?? /title="([^"]*)"/.exec(m[0])?.[1] ?? m[0]);
}

describe("E2: a rail row is one name, its counts hidden (FR-6, T8)", () => {
  it("names each row `<id>, <client>, rank <n>, <a> now, <b> blocked, <c> next`, zeros said", () => {
    const html = rail();
    const rows = [...html.matchAll(/<div[^>]*data-rail-row="([^"]+)"[^>]*>/g)].map((m) => /aria-label="([^"]*)"/.exec(m[0])?.[1]);
    expect(rows).toEqual([
      "a, acme, rank 1, 1 now, 0 blocked, 2 next",
      "b, rank 2, 2 now, 1 blocked, 0 next",
      "c, acme, rank 3, 0 now, 0 blocked, 3 next",
    ]);
  });

  it("hides every row's counts from AX", () => {
    const html = rail();
    const counts = html.match(/<span class="rail-counts mono"[^>]*>/g) ?? [];
    expect(counts.length).toBeGreaterThanOrEqual(3);
    for (const c of counts) expect(c).toContain('aria-hidden="true"');
  });

  it("the row carries the name on the drag handle's button role, never on a plain div", () => {
    for (const m of rail().matchAll(/<div[^>]*aria-label=[^>]*>/g)) expect(m[0]).toContain('role="button"');
  });

  it("the strip's items read the same name", () => {
    expect(rail({ strip: true })).toContain('aria-label="b, rank 2, 2 now, 1 blocked, 0 next"');
    expect(rowName({ id: "x", client: "", now: 0, blocked: 0, next: 0 }, 4)).toBe("x, rank 4, 0 now, 0 blocked, 0 next");
  });
});

describe("E3: a group head is two stops (FR-7, T9)", () => {
  const groups = [{ name: "one", initiatives: ["a"] }, { name: "two", initiatives: ["b", "c"] }];

  it("between the last row of one group and the first of the next, Tab stops on Collapse and Actions only", () => {
    const stops = tabStops(rail({ groups }));
    const a = stops.indexOf("a, acme, rank 1, 1 now, 0 blocked, 2 next");
    const b = stops.indexOf("b, rank 2, 2 now, 1 blocked, 0 next");
    expect(a).toBeGreaterThan(-1);
    expect(stops.slice(a + 1, b)).toEqual(["Collapse two", "Actions for two"]);
  });

  it("the group's drag handle is tabindex -1 and no button to AX; the mouse keeps its handle", () => {
    const heads = rail({ groups }).match(/<div class="rail-group-head ?"[^>]*>/g) ?? [];
    expect(heads).toHaveLength(2);
    for (const h of heads) {
      expect(h).toContain('tabindex="-1"');
      expect(h).toContain("data-rfd-drag-handle-draggable-id");
      expect(h).not.toContain('role="button"');
    }
  });

  it("the ⋯ is a menu button named Actions for <group>; no pencil and no ✕ beside it", () => {
    const html = rail({ groups });
    expect(html).toMatch(/<button[^>]*data-group-actions="1"[^>]*aria-label="Actions for two"[^>]*aria-haspopup="menu"[^>]*aria-expanded="false"/);
    expect(html).not.toContain('title="rename"');
    expect(html).not.toContain('title="remove group');
  });

  it("the menu holds Rename, Move up, Move down, Remove; the ends are off", () => {
    expect(["Rename", "Move up", "Move down", "Remove"].map((a) => groupActionOff(a as never, 0, 3))).toEqual([false, true, false, false]);
    expect(groupActionOff("Move down", 2, 3)).toBe(true);
    expect(groupActionOff("Move up", 2, 3)).toBe(false);
    const html = renderToStaticMarkup(<GroupActions name="g" index={0} count={2} onRename={() => undefined} onMove={() => undefined} onRemove={() => undefined} />);
    expect(html).not.toContain('role="menu"'); // closed until pressed
  });
});

describe("E3: Move up and Move down reorder the groups", () => {
  it("moves the group one place and the order is what the rail stores", async () => {
    const { move } = await import("../lib");
    const g = [{ name: "one" }, { name: "two" }, { name: "three" }];
    expect(move(g, 1, 0).map((x) => x.name)).toEqual(["two", "one", "three"]);
    expect(move(g, 1, 2).map((x) => x.name)).toEqual(["one", "three", "two"]);
  });
});

describe("E4: the strip is one stop for every rank (FR-8, T10)", () => {
  it("one strip item is tabindex 0, the others -1, roles too", () => {
    const html = rail({ strip: true, selected: "b" });
    const items = [...html.matchAll(/<button[^>]*class="strip-item[^"]*"[^>]*>/g)].map((m) => m[0]).filter((b) => b.includes("data-rail-row"));
    expect(items).toHaveLength(4); // a role and three ranks
    expect(items.filter((b) => b.includes('tabindex="0"'))).toHaveLength(1);
    expect(items.find((b) => b.includes('tabindex="0"'))).toContain('data-rail-row="b"');
  });

  it("the strip's Tab count does not grow with initiatives or roles", () => {
    expect(tabStops(rail({ strip: true })).length).toBe(tabStops(rail({ strip: true, more: 3, roles: 3 })).length);
  });
});

describe("E5: Roles join the rail's roving set (FR-9, T11)", () => {
  it("Down past the last initiative lands on the first role, and holds at the last role", () => {
    const walk = ["a", "b", "c", "role:Aglaea", "role:Hermes"];
    expect(rovingMove(walk, "c", "ArrowDown")).toBe("role:Aglaea");
    expect(rovingMove(walk, "role:Aglaea", "ArrowUp")).toBe("c");
    expect(rovingMove(walk, "role:Hermes", "ArrowDown")).toBe("role:Hermes");
  });

  it("a role is no stop of its own, and is one while the arrows hold it", () => {
    expect([...rovingStops([["a", "b"]], ["role:x"], null, null)]).toEqual(["a"]);
    expect([...rovingStops([["a", "b"]], ["role:x"], null, "role:x")]).toEqual(["a", "role:x"]);
    expect([...rovingStops([["a"], ["b", "c"]], [], "c", null)]).toEqual(["a", "c"]);
  });

  it("the rail's role rows are in the walk, tabindex -1, opening their drawer by a click", () => {
    const html = rail({ roles: 2 });
    const roles = html.match(/<button[^>]*class="rail-item role[^"]*"[^>]*>/g) ?? [];
    expect(roles).toHaveLength(2);
    for (const r of roles) {
      expect(r).toContain('tabindex="-1"');
      expect(r).toMatch(/data-rail-row="role:Role\d"/);
      expect(r).toContain('aria-haspopup="dialog"');
    }
    expect(tabStops(html)).toContain("Collapse Roles");
  });

  it("the rail's Tab count is equal on the fixture and with three more initiatives and two more roles", () => {
    expect(tabStops(rail({ more: 3, roles: 3 }))).toEqual(tabStops(rail()));
    const groups = [{ name: "one", initiatives: ["a", "z0", "z1"] }, { name: "two", initiatives: ["b", "c", "z2"] }];
    expect(tabStops(rail({ groups, more: 3, roles: 3 })).length).toBe(tabStops(rail({ groups: [{ name: "one", initiatives: ["a"] }, { name: "two", initiatives: ["b", "c"] }] })).length);
  });
});
