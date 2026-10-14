import { describe, expect, it } from "vitest";
import type { AgentGroup, AgentsView, BoardView, CellThread, Seat } from "../hooks/useWails";
import type { merge, model, service } from "../../wailsjs/go/models";
import { bandWords, launchVerb, missingPersonas, needsMeRows, needsMeShown, needsMeThread, NEEDS_ME_FIRST, pastFirst, personaMissing, queueOf, readOnlyOf, spanWords, taskContext, taskLine, threadContext } from "./queue";
import { HEALTH } from "./health";

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

describe("needsMeRows: files the scan could not read", () => {
  const withProblems = (id: string, problems: Partial<model.Problem>[], status = "active") =>
    ({ id, local: true, status, path: `/h/${id}`, decisions: [{ number: "0001", status: "proposed", owner: "pablo", raised: "2026-09-01" }], problems }) as unknown as merge.BoardInitiative;

  it("adds one row per initiative with unread files, after the dated rows", () => {
    const view = board([withProblems("a", [
      { path: "/h/a/working-on/x.md", msg: "no frontmatter: file must start with ---", unread: true },
      { path: "/h/a/working-on/y.md", msg: "yaml: line 4: block sequence entries are not allowed in this context", unread: true },
      { path: "/h/a/working-on/z.md", msg: "missing title", unread: false },
    ])]);
    const rows = needsMeRows(view, agents(group("a")));
    expect(rows.map((r) => r.key)).toEqual(["decision:a/0001", "unread:a"]);
    const row = rows[1];
    expect(row.kind === "unread" && row.files.map((f) => f.path)).toEqual(["/h/a/working-on/x.md", "/h/a/working-on/y.md"]);
  });

  it("adds no row for problems on files that were read, or for an initiative that is not active", () => {
    const view = board([
      withProblems("a", [{ path: "/h/a/working-on/z.md", msg: "missing title", unread: false }]),
      withProblems("b", [{ path: "/h/b/working-on/x.md", msg: "no frontmatter", unread: true }], "archived"),
    ]);
    expect(kinds(view, agents()).filter((k) => k.startsWith("unread:"))).toEqual([]);
  });
});

describe("readOnlyOf: the read-only word (initiatives-view I14)", () => {
  const withStatus = (status: string) => ({ ...initiative("a"), status }) as merge.BoardInitiative;
  it("says asleep for a paused initiative, never paused", () => {
    expect(readOnlyOf(board([withStatus("paused")]), "a")).toBe("asleep");
  });
  it("says archived, or a status it has no word for as written", () => {
    expect(readOnlyOf(board([withStatus("archived")]), "a")).toBe("archived");
    expect(readOnlyOf(board([withStatus("done")]), "a")).toBe("done");
  });
  it("is null for an awake one", () => {
    expect(readOnlyOf(board([withStatus("active")]), "a")).toBeNull();
    expect(readOnlyOf(board([withStatus("")]), "a")).toBeNull();
  });
});

// R1 (leftovers-28 FR-5): a task over its forecast or stalled is one row.
describe("needsMeRows: tasks over their forecast or stalled", () => {
  const task = (number: string, state: string, t: Record<string, unknown> = {}) =>
    ({ number, title: `Task ${number}`, forecast: "70-110m", forecast_top: 110, started: "2026-10-14T10:00:00Z",
      elapsed_minutes: 130, cards: [{ slug: "a", status: "now" }, { slug: "b", status: "next" }], seats: [], supervisor: "",
      state, ...t }) as unknown as service.Task;
  const post = { thread_id: "t1", from: "sup64", subject: "leftovers-28", line: "band top: the builder is at X0" };
  const view = board([initiative("a")]);
  const rows = needsMeRows(view, agents(group("a", { tasks: [
    task("0120", "on"),
    task("0121", "over", { last_post: post }),
    task("0122", "stalled", { elapsed_minutes: 230, started: "2026-10-14T09:00:00Z" }),
    task("0123", "stalled", { quiet_minutes: 52 }),
  ] })));
  const tasks = rows.filter((r) => r.kind === "task");

  it("has rows only for over and stalled, one per task (not per card), oldest first", () => {
    expect(tasks.map((r) => r.key)).toEqual(["task:a/0122", "task:a/0121", "task:a/0123"]);
    expect(tasks[0].since?.toISOString()).toBe("2026-10-14T09:00:00.000Z");
  });

  it("says FR-5's words", () => {
    const t = (n: string) => (tasks.find((r) => r.key === `task:a/${n}`) as Extract<typeof tasks[number], { kind: "task" }>).task;
    expect(taskLine(t("0121"))).toBe("Task 0121: over its forecast, 2 h 10 m of 70-110 min");
    expect(taskLine(t("0122"))).toBe("Task 0122: stalled, 3 h 50 m, twice its forecast");
    expect(taskLine(t("0123"))).toBe("Task 0123: stalled, no post for 52 min");
    expect(taskContext(t("0121"))).toBe("sup64: leftovers-28: band top: the builder is at X0");
    expect(taskContext(t("0123"))).toBe("record 0123 · a now, b next · no post from its supervisor");
  });

  it("names the silence only while a card is in now", () => {
    const quietNoneNow = task("0124", "stalled", { quiet_minutes: 52, elapsed_minutes: 240, cards: [{ slug: "a", status: "next" }] });
    expect(taskLine(quietNoneNow)).toBe("Task 0124: stalled, 4 h, twice its forecast");
  });

  it("spells units and spans", () => {
    expect(bandWords("1.5-3h")).toBe("1.5-3 h");
    expect(bandWords("40-90m")).toBe("40-90 min");
    expect(spanWords(52)).toBe("52 m");
    expect(spanWords(180)).toBe("3 h");
  });

  it("has no rows for an initiative that is not active", () => {
    const asleep = board([{ ...initiative("a"), status: "paused" } as unknown as merge.BoardInitiative]);
    expect(needsMeRows(asleep, agents(group("a", { tasks: [task("0121", "over")] }))).filter((r) => r.kind === "task")).toEqual([]);
  });
});

// R3 (leftovers-28 FR-6): an ask from a seat that is not picking up says so.
describe("needsMeRows: asks name the seat and whether it picks up", () => {
  const ask = (id: number, asked_by: string, age: number) =>
    ({ id, status: "open", asked_of_me: 1, asked_by, messages: 2, age_seconds: age, subject: `s${id}` }) as unknown as CellThread;
  const seat = (name: string, watcher: string) => ({ name, watcher, deaf: false, capped: false, undelivered: 0 }) as unknown as Seat;
  const rows = needsMeRows(board([initiative("a")]), agents(group("a", {
    threads: [ask(1, "po_ana", 60), ask(2, "hestia", 600)],
    crew: [seat("po_ana", "alive"), seat("hestia", "stale")],
  }))).filter((r) => r.kind === "thread") as Extract<ReturnType<typeof needsMeRows>[number], { kind: "thread" }>[];

  it("keeps the rows oldest first and keyed to their thread", () => {
    expect(rows.map((r) => r.key)).toEqual(["thread:2", "thread:1"]);
  });

  it("says the stale asker is not picking up in HEALTH's words; the alive one does not", () => {
    expect(threadContext(rows[0])).toBe(`hestia asks you · 2 messages · hestia is not picking up (${HEALTH.stale.label}): ${HEALTH.stale.why}`);
    expect(threadContext(rows[1])).toBe("po_ana asks you · 2 messages");
    expect(threadContext(rows[1])).not.toContain("not picking up");
  });

  it("uses the deaf and capped words too, and says nothing for a seat off the roster", () => {
    const deaf = { thread: ask(3, "dev_bruno", 1), asker: "deaf" as const };
    expect(threadContext(deaf)).toContain(`dev_bruno is not picking up (deaf): ${HEALTH.deaf.why}`);
    const off = needsMeRows(board([initiative("a")]), agents(group("a", { threads: [ask(4, "ghost", 1)] })))[0];
    expect(off.kind === "thread" && threadContext(off)).toBe("ghost asks you · 2 messages");
  });
});
