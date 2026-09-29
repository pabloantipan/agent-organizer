import { describe, expect, it } from "vitest";
import type { AgentGroup, AgentsView, BoardView, CellThread } from "../hooks/useWails";
import type { merge, model } from "../../wailsjs/go/models";
import { needsMeRows, queueOf } from "./queue";

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
