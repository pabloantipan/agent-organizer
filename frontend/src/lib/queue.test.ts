import { describe, expect, it } from "vitest";
import type { AgentGroup, AgentsView, BoardView, CellThread } from "../hooks/useWails";
import type { merge, model } from "../../wailsjs/go/models";
import { launchVerb, missingPersonas, needsMeRows, needsMeShown, needsMeThread, NEEDS_ME_FIRST, pastFirst, personaMissing, queueOf } from "./queue";

// Fixtures are plain objects: the generated classes carry methods the
// functions under test never call, so each builder casts once.
const initiative = (id: string, decisions: Partial<model.Decision>[] = []) =>
  ({ id, local: true, status: "active", decisions }) as unknown as merge.BoardInitiative;

const card = (initiative_id: string, slug: string, next: string, local = true) =>
  ({ initiative_id, slug, next, local, updated: "2026-09-20" }) as unknown as merge.BoardCard;

const board = (initiatives: merge.BoardInitiative[], now: merge.BoardCard[] = [], resolved: Record<string, string> = {}) =>
  ({ board: { initiatives, columns: { now, blocked: [], next: [] } }, order: { resolved } }) as unknown as BoardView;

const thread = (id: number, status: string, asked_of_me = 0) =>
  ({ id, status, asked_of_me, age_seconds: 60 }) as unknown as CellThread;

const group = (id: string, g: Partial<AgentGroup> = {}) =>
  ({ id, cell: { human: "pablo", state: "running" }, threads: [], crew: [], agents: [], waves: [], ...g }) as unknown as AgentGroup;

const agents = (...groups: AgentGroup[]) => ({ groups }) as unknown as AgentsView;

const kinds = (view: BoardView, a: AgentsView) => needsMeRows(view, a).map((r) => r.key);

describe("needsMeRows: decision records", () => {
  it("lists a proposed record owned by the lead", () => {
    const view = board([initiative("a", [{ number: "0007", status: "proposed", owner: "pablo", raised: "2026-09-01" }])]);
    expect(kinds(view, agents(group("a")))).toEqual(["decision:a/0007"]);
  });

  it("lists a proposed record owned by the cell's human when that is the lead", () => {
    const view = board([initiative("a", [{ number: "0008", status: "proposed", owner: "Ana", raised: "2026-09-01" }])]);
    expect(kinds(view, agents(group("a", { cell: { human: "ana" } as model.Cell })))).toEqual(["decision:a/0008"]);
  });

  it("leaves out a proposed record owned by someone else, and a ruled one", () => {
    const view = board([
      initiative("a", [
        { number: "0009", status: "proposed", owner: "business", raised: "2026-09-01" },
        { number: "0010", status: "ruled", owner: "pablo", raised: "2026-09-01" },
      ]),
    ]);
    expect(kinds(view, agents(group("a")))).toEqual([]);
  });
});

describe("needsMeRows and queueOf: threads", () => {
  it("lists an escalated thread and leaves out an open one that asks nothing", () => {
    const g = group("a", { threads: [thread(1, "escalated"), thread(2, "open")] });
    const view = board([initiative("a")]);
    expect(kinds(view, agents(g))).toEqual(["thread:1"]);
    expect(queueOf(g, view).threads.map((t) => t.id)).toEqual([1]);
  });

  it("lists an open thread that asks the human", () => {
    const g = group("a", { threads: [thread(3, "open", 1)] });
    expect(kinds(board([initiative("a")]), agents(g))).toEqual(["thread:3"]);
  });
});

describe("needsMeThread: [for <role>] relays (0079)", () => {
  const subj = (subject: string, status: string, asked_of_me = 0) => ({ ...thread(9, status, asked_of_me), subject }) as CellThread;

  it("leaves out a relay asked of the human, an escalated one in any case, and one with leading spaces", () => {
    expect(needsMeThread(subj("[for hephaistos] x", "open", 1))).toBe(false);
    expect(needsMeThread(subj("[FOR aglaea] x", "escalated"))).toBe(false);
    expect(needsMeThread(subj(" [for talos] x", "open", 1))).toBe(false);
  });

  it("keeps a subject that only contains [for later, and a plain asked thread", () => {
    expect(needsMeThread(subj("re: [for hephaistos] x", "open", 1))).toBe(true);
    expect(needsMeThread(subj("plain question", "open", 1))).toBe(true);
  });
});

describe("needsMeRows and queueOf: cards", () => {
  it("lists a local card whose next action starts with pablo:, not one for another seat or machine", () => {
    const cards = [card("a", "ask-pablo", "pablo: pick one"), card("a", "for-fse", "fse: spec it"), card("a", "remote", "pablo: elsewhere", false)];
    const view = board([initiative("a")], cards);
    expect(kinds(view, agents(group("a")))).toEqual(["card:a/ask-pablo"]);
    expect(queueOf(group("a"), view).total).toBe(1);
  });
});

describe("Solved marks", () => {
  it("remove the card and the thread they name", () => {
    const g = group("a", { threads: [thread(1, "escalated"), thread(2, "escalated")] });
    const cards = [card("a", "one", "pablo: one"), card("a", "two", "decide: two")];
    const open = board([initiative("a")], cards);
    expect(kinds(open, agents(g)).sort()).toEqual(["card:a/one", "card:a/two", "thread:1", "thread:2"]);

    const solved = board([initiative("a")], cards, { "card:a/one": "2026-09-29", "thread:2": "2026-09-29" });
    expect(kinds(solved, agents(g)).sort()).toEqual(["card:a/two", "thread:1"]);
    expect(queueOf(g, solved).total).toBe(2);
  });
});

describe("FR-7 Launch row", () => {
  it("is added, last, for a non-draft cell in definition", () => {
    const g = group("a", { cell: { human: "pablo", state: "in_definition", draft: false } as model.Cell, threads: [thread(1, "escalated")] });
    expect(kinds(board([initiative("a")]), agents(g))).toEqual(["thread:1", "launch:a"]);
  });

  it("is not added for a draft cell", () => {
    const g = group("a", { cell: { human: "pablo", state: "in_definition", draft: true } as model.Cell });
    expect(kinds(board([initiative("a")]), agents(g))).toEqual([]);
  });

  it("is not added once the cell has run", () => {
    const g = group("a", { cell: { human: "pablo", state: "running" } as model.Cell });
    expect(kinds(board([initiative("a")]), agents(g))).toEqual([]);
  });
});

describe("FR-3 (lead-side-fixes): a cell that cannot launch says why", () => {
  const seat = (name: string, no_persona = false) => ({ name, no_persona });
  const defining = (crew: { name: string; no_persona: boolean }[]) =>
    group("a", { cell: { human: "pablo", state: "in_definition", draft: false } as model.Cell, crew: crew as unknown as AgentGroup["crew"] });
  const row = (g: AgentGroup) => needsMeRows(board([initiative("a")]), agents(g))[0];

  it("names the first seat with no persona file, verb Open", () => {
    const r = row(defining([seat("po_carla"), seat("designer_diego", true), seat("tech_lead_elena", true)]));
    expect(r.kind).toBe("launch");
    expect(r.kind === "launch" && launchVerb(r)).toEqual({ verb: "Open", blocker: "designer_diego has no persona file; the drafting session writes it, or write it by the persona-agents skill" });
  });

  it("keeps Launch when every seat has its file", () => {
    const r = row(defining([seat("po_lucia"), seat("dev_mateo")]));
    expect(r.kind === "launch" && launchVerb(r)).toEqual({ verb: "Launch", blocker: null });
  });
});

describe("FR-9 (ui-leftovers): a missing persona file says who writes it", () => {
  it("names one seat", () => {
    expect(personaMissing(["designer_diego"])).toBe("designer_diego has no persona file; the drafting session writes it, or write it by the persona-agents skill");
  });
  it("names several, in roster order", () => {
    expect(personaMissing(["a", "b", "c"])).toBe("a, b and c have no persona files; the drafting session writes them, or write them by the persona-agents skill");
  });
  it("says nothing when every file is there", () => {
    expect(personaMissing([])).toBe("");
    expect(missingPersonas([{ name: "a", no_persona: false }, { name: "b", no_persona: true }])).toEqual(["b"]);
    expect(missingPersonas(undefined)).toEqual([]);
  });
});

describe("needsMeShown (leftovers-11 FR-1)", () => {
  const rows = Array.from({ length: 14 }, (_, i) => i);
  it("shows the oldest five and counts the other nine at compact and regular", () => {
    const { shown, hidden } = needsMeShown(rows, false, false);
    expect(NEEDS_ME_FIRST).toBe(5);
    expect(shown).toEqual([0, 1, 2, 3, 4]);
    expect(hidden).toBe(9);
  });
  it("shows every row when all are asked for, or at wide", () => {
    expect(needsMeShown(rows, true, false)).toEqual({ shown: rows, hidden: 0 });
    expect(needsMeShown(rows, false, true)).toEqual({ shown: rows, hidden: 0 });
  });
  it("hides nothing at five or fewer, and one at six", () => {
    expect(needsMeShown(rows.slice(0, 5), false, false)).toEqual({ shown: [0, 1, 2, 3, 4], hidden: 0 });
    expect(needsMeShown([], false, false)).toEqual({ shown: [], hidden: 0 });
    expect(needsMeShown(rows.slice(0, 6), false, false).hidden).toBe(1);
  });
  it("keeps the rows themselves, so the count stays needsMeRows' length", () => {
    const { shown, hidden } = needsMeShown(rows, false, false);
    expect(shown.length + hidden).toBe(rows.length);
  });
});

describe("pastFirst (leftovers-12 FR-5)", () => {
  const rows = Array.from({ length: 14 }, (_, i) => ({ key: `k${i + 1}` }));
  it("is true for a row behind Show the other N: row 6 and row 12", () => {
    expect(pastFirst(rows, "k6")).toBe(true);
    expect(pastFirst(rows, "k12")).toBe(true);
  });
  it("is false for the first five, an unknown key and no key", () => {
    expect(pastFirst(rows, "k1")).toBe(false);
    expect(pastFirst(rows, "k5")).toBe(false);
    expect(pastFirst(rows, "nope")).toBe(false);
    expect(pastFirst(rows, null)).toBe(false);
    expect(pastFirst(rows, undefined)).toBe(false);
  });
});
