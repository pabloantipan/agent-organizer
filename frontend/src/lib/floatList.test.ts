import { describe, expect, it } from "vitest";
import type { AgentGroup, AgentsView, BoardView } from "../hooks/useWails";
import type { merge, model } from "../../wailsjs/go/models";
import { filterList, floatList, focusOrder, foldSignals, HOME, homeCount, homeLabel, matches, type FloatRow, type Signal } from "./floatList";
import { needsMeRows } from "./queue";

// Plain objects, cast once, as queue.test.ts does.
const initiative = (id: string, i: Partial<merge.BoardInitiative> = {}) =>
  ({ id, local: true, status: "active", goal: "", decisions: [], ...i }) as unknown as merge.BoardInitiative;

const card = (initiative_id: string, slug: string, status: string) =>
  ({ initiative_id, slug, status, next: "", local: true, updated: "2026-10-01" }) as unknown as merge.BoardCard;

const board = (initiatives: merge.BoardInitiative[], cards: merge.BoardCard[] = [], groups: model.Group[] = []) =>
  ({
    board: { initiatives, columns: { now: cards.filter((c) => c.status === "now"), blocked: cards.filter((c) => c.status === "blocked"), next: cards.filter((c) => c.status === "next") } },
    order: { groups, resolved: {} },
  }) as unknown as BoardView;

const group = (id: string, g: Partial<AgentGroup> = {}) =>
  ({ id, cell: { human: "pablo", state: "running" }, threads: [], crew: [], agents: [], waves: [], ...g }) as unknown as AgentGroup;

const agents = (...groups: AgentGroup[]) => ({ groups }) as unknown as AgentsView;

const ids = (rows: FloatRow[]) => rows.map((r) => r.id);

describe("floatList: the rail's order and groups", () => {
  it("is one unnamed section in priority order when there are no groups, ranked", () => {
    const l = floatList(board([initiative("b"), initiative("a")]), null);
    expect(l.sections).toHaveLength(1);
    expect(l.sections[0].name).toBe("");
    expect(ids(l.sections[0].rows)).toEqual(["b", "a"]);
    expect(l.sections[0].rows.map((r) => r.rank)).toEqual([1, 2]);
  });

  it("follows the stored groups, then the ungrouped rest, with ranks from the flat priority", () => {
    const view = board([initiative("a"), initiative("b"), initiative("c")], [], [{ name: "client x", initiatives: ["b"] } as model.Group]);
    const l = floatList(view, null);
    expect(l.sections.map((s) => s.name)).toEqual(["client x", "ungrouped"]);
    expect(ids(l.sections[0].rows)).toEqual(["b"]);
    expect(ids(l.sections[1].rows)).toEqual(["a", "c"]);
    expect(l.sections[0].rows[0].rank).toBe(2);
  });

  it("puts initiatives that are not active last, unranked, and out of every group", () => {
    const view = board([initiative("a"), initiative("old", { status: "archived" }), initiative("c")], [], [{ name: "g", initiatives: ["old", "c"] } as model.Group]);
    const l = floatList(view, null);
    expect(l.sections.flatMap((s) => ids(s.rows))).toEqual(["c", "a"]);
    expect(ids(l.inactive)).toEqual(["old"]);
    expect(l.inactive[0].rank).toBeNull();
    expect(l.sections[0].rows[0].rank).toBe(2); // "c" is rank 2 of the active, "old" takes none
  });

  it("is empty with no initiatives", () => {
    expect(floatList(board([]), null)).toEqual({ sections: [], inactive: [] });
  });
});

describe("floatList: signals in the fold order", () => {
  it("draws waiting, blocked, now, live, the cell and problems in Home's order", () => {
    const i = initiative("a", {
      decisions: [{ number: "0001", status: "proposed", owner: "pablo", raised: "2026-10-01" }] as model.Decision[],
      problems: ["x"] as unknown as merge.BoardInitiative["problems"],
      live: 2,
      working: 1,
    });
    const view = board([i], [card("a", "one", "blocked"), card("a", "two", "now"), card("a", "three", "now")]);
    const l = floatList(view, agents(group("a", { cell: { human: "pablo", state: "in_definition" } as model.Cell })));
    const s = l.sections[0].rows[0].signals;
    expect(s.map((x) => x.kind)).toEqual(["waiting", "blocked", "now", "live", "cell", "problems"]);
    expect(s[0].text).toBe("1 waiting · you");
    expect(s[0].floor).toBe("1 waiting");
    expect(s[1]).toMatchObject({ text: "1 blocked", fold: null });
    expect(s[2].text).toBe("2 now");
    expect(s[3].text).toBe("1 working");
    expect(s[5].text).toBe("1 problem");
  });

  it("has no signals for a quiet initiative", () => {
    expect(floatList(board([initiative("a")]), null).sections[0].rows[0].signals).toEqual([]);
  });
});

describe("foldSignals", () => {
  const sig = (kind: Signal["kind"], text: string, fold: number | null, floor?: string): Signal => ({ kind, text, fold, floor });
  const waiting = sig("waiting", "2 waiting · you, business", 4, "2 waiting");
  const blocked = sig("blocked", "1 blocked", null);
  const now = sig("now", "3 now", 1);
  const live = sig("live", "2 live", 0);
  const problems = sig("problems", "1 problem", 2);

  it("shows everything when it fits", () => {
    expect(foldSignals([blocked, now], 40)).toEqual({ shown: [blocked, now], rest: [], cut: false });
  });

  it("folds live first, then now, then problems", () => {
    const all = [blocked, now, live, problems];
    expect(foldSignals(all, 29).rest).toEqual([live]);
    expect(foldSignals(all, 23).rest).toEqual([now, live]);
    expect(foldSignals(all, 13).rest).toEqual([now, live, problems]);
  });

  it("never folds blocked or waiting, and cuts waiting to its floor when they do not fit whole", () => {
    const r = foldSignals([waiting, blocked, now, live], 22);
    expect(r.shown).toEqual([waiting, blocked]);
    expect(r.rest).toEqual([now, live]);
    expect(r.cut).toBe(true);
    const tiny = foldSignals([waiting, blocked], 2);
    expect(tiny.shown).toEqual([waiting, blocked]);
  });
});

describe("search", () => {
  const row = (id: string, goal: string): FloatRow => ({ id, goal, rank: 1, signals: [] });

  it("matches every word, in any order, in the id or the goal", () => {
    expect(matches(row("partner-payouts", "Partners are paid on time"), "pay")).toBe(true);
    expect(matches(row("partner-payouts", "Partners are paid on time"), "time PART")).toBe(true);
    expect(matches(row("partner-payouts", "Partners are paid on time"), "pay late")).toBe(false);
    expect(matches(row("a", ""), "")).toBe(true);
  });

  it("keeps a group heading only over a group with matches", () => {
    const view = board([initiative("partner-payouts"), initiative("camp"), initiative("old-pay", { status: "paused" })], [], [{ name: "x", initiatives: ["camp"] } as model.Group]);
    const l = filterList(floatList(view, null), "pay");
    expect(l.sections.map((s) => s.name)).toEqual(["ungrouped"]);
    expect(ids(l.sections[0].rows)).toEqual(["partner-payouts"]);
    expect(ids(l.inactive)).toEqual(["old-pay"]);
  });
});

describe("focusOrder", () => {
  const view = board([initiative("a"), initiative("b"), initiative("z", { status: "paused" })]);
  const l = floatList(view, null);

  it("starts on Home, then the rows; the not-active ones only when their group is open", () => {
    expect(focusOrder(l, "", false)).toEqual([HOME, "a", "b"]);
    expect(focusOrder(l, "", true)).toEqual([HOME, "a", "b", "z"]);
  });

  it("drops Home under a query and starts on the first match", () => {
    expect(focusOrder(filterList(l, "b"), "b", false)).toEqual(["b"]);
  });
});

describe("the Home row", () => {
  it("counts the rows of Needs me, the top bar's badge", () => {
    const view = board([initiative("a", { decisions: [{ number: "0001", status: "proposed", owner: "pablo", raised: "2026-10-01" }, { number: "0002", status: "proposed", owner: "", raised: "2026-10-02" }] as model.Decision[] })]);
    const a = agents(group("a"));
    expect(homeCount(view, a)).toBe(needsMeRows(view, a).length);
    expect(homeCount(view, a)).toBe(2);
  });

  it("reads Home · N need you, or Home alone when nothing waits", () => {
    expect(homeLabel(3)).toBe("Home · 3 need you");
    expect(homeLabel(1)).toBe("Home · 1 needs you");
    expect(homeLabel(0)).toBe("Home");
  });
});
