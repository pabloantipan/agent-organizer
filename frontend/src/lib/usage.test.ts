import { describe, expect, it } from "vitest";
import {
  agentsWeekLine, barLabel, changeWords, groupWaves, compact, duration, forInitiative, hoursWords, isoWeekOf, kindsLine,
  money, moneyGrid, reasonsWords, roleWords, rowDetail, shareWords, shiftWeek, sortRows, startWords, totalsNotes,
  usageColumns, weekLabel, weekRange, type UsageRow, type UsageSession,
} from "./usage";

const now = new Date(2026, 9, 8);

describe("money", () => {
  it("prints dollars and cents with thousands separators", () => {
    expect(money(84.2)).toBe("$84.20");
    expect(money(3371.944)).toBe("$3,371.94");
    expect(money(0)).toBe("$0.00");
    expect(money(1234567.5)).toBe("$1,234,567.50");
  });
  it("reads no cost as a dash", () => {
    expect(money(null)).toBe("—");
    expect(money(undefined)).toBe("—");
  });
});

describe("compact", () => {
  it("reads tokens as data", () => {
    expect(compact(25_000_000)).toBe("25.0M");
    expect(compact(830_400)).toBe("830k");
    expect(compact(8_300)).toBe("8.3k");
    expect(compact(412)).toBe("412");
    expect(compact(1_240_000_000)).toBe("1.2B");
    expect(compact(999_960)).toBe("1.0M");
    expect(compact(0)).toBe("0");
  });
});

describe("kindsLine", () => {
  it("names the four kinds largest first", () => {
    expect(kindsLine({ input: 1_100_000, output: 600_000, cache_read: 38_000_000, cache_write: 1_500_000 }))
      .toBe("cache read 38.0M · cache write 1.5M · input 1.1M · output 600k");
  });
});

describe("weeks", () => {
  it("names the ISO week, Monday first, across a year", () => {
    expect(isoWeekOf(new Date(2026, 9, 6))).toBe("2026-W41");
    expect(isoWeekOf(new Date(2026, 9, 5))).toBe("2026-W41");
    expect(isoWeekOf(new Date(2026, 9, 4))).toBe("2026-W40");
    expect(isoWeekOf(new Date(2027, 0, 1))).toBe("2026-W53");
    expect(isoWeekOf(new Date(2025, 11, 29))).toBe("2026-W01");
  });
  it("moves by weeks", () => {
    expect(shiftWeek("2026-W41", -1)).toBe("2026-W40");
    expect(shiftWeek("2026-W01", -1)).toBe("2025-W52");
    expect(shiftWeek("2026-W53", 1)).toBe("2027-W01");
  });
  it("says a week's days in words", () => {
    expect(weekRange("2026-10-05", "2026-10-11", now)).toBe("5–11 Oct");
    expect(weekRange("2026-09-28", "2026-10-04", now)).toBe("28 Sep–4 Oct");
    expect(weekRange("2025-12-29", "2026-01-04", now)).toBe("29 Dec 2025–4 Jan");
  });
  it("labels this week, last week, a partial first week and others", () => {
    expect(weekLabel({ week: "2026-W41", start: "2026-10-05" }, "2026-W41", now)).toBe("This week · 5–11 Oct");
    expect(weekLabel({ week: "2026-W40", start: "2026-09-28" }, "2026-W41", now)).toBe("Last week · 28 Sep–4 Oct");
    expect(weekLabel({ week: "2026-W38", start: "2026-09-14", from: "2026-09-16" }, "2026-W41", now)).toBe("from 16 Sep");
    expect(weekLabel({ week: "2026-W39", start: "2026-09-21" }, "2026-W41", now)).toBe("21–27 Sep");
    expect(barLabel({ start: "2026-09-14", from: "2026-09-16" }, now)).toBe("16 Sep");
  });
});

describe("words", () => {
  it("says the change on last week in words", () => {
    expect(changeWords(84.2, 75.1)).toBe("+12% on last week ($75.10)");
    expect(changeWords(69.1, 75.1)).toBe("−8% on last week ($75.10)");
    expect(changeWords(75.2, 75.1)).toBe("about the same as last week ($75.10)");
    expect(changeWords(10, 0)).toBe("nothing spent the week before");
  });
  it("says time, length and starts", () => {
    expect(hoursWords(13.6)).toBe("14 h of work");
    expect(hoursWords(0.66)).toBe("40 min of work");
    expect(duration(134)).toBe("2 h 14 min");
    expect(duration(38)).toBe("38 min");
    expect(duration(120)).toBe("2 h");
    expect(duration(0.2)).toBe("under a minute");
    expect(startWords("2026-10-05T14:02:00-03:00", now).endsWith(":02")).toBe(true);
    expect(startWords(new Date(2026, 9, 5, 14, 2).toISOString(), now)).toBe("Mon 5 Oct 14:02");
  });
  it("says shares, reasons, notes and roles", () => {
    expect(shareWords(0.618)).toBe("62%");
    expect(shareWords(0.004)).toBe("<1%");
    expect(shareWords(0)).toBe("0%");
    expect(reasonsWords([{ reason: "no initiative root", sessions: 2 }, { reason: "no card", sessions: 1 }])).toBe("no initiative root (2 sessions); no card (1 session)");
    expect(totalsNotes({ running: 2, without_cost: 3 })).toEqual(["includes 2 running", "excludes 3 sessions with no cost"]);
    expect(totalsNotes({ running: 0, without_cost: 1 })).toEqual(["excludes 1 session with no cost"]);
    expect(roleWords("fse")).toBe("FSE");
    expect(roleWords("builder")).toBe("builder");
  });
});

const row = (key: string, m: number, t: number, na = false): UsageRow => ({
  key, name: key || "Not attributed", money: m, share: 0, input: 0, output: 0, cache_read: 0, cache_write: 0, tokens: t, sessions: 1, without_cost: 0, not_attributed: na,
});

describe("sortRows", () => {
  it("sorts by money, then tokens, with Not attributed last whatever it holds", () => {
    const out = sortRows([row("", 99, 9, true), row("b", 5, 1), row("a", 50, 1), row("c", 5, 7)]);
    expect(out.map((r) => r.key)).toEqual(["a", "c", "b", ""]);
  });
});

describe("moneyGrid", () => {
  it("puts $0 and one or two round lines over the tallest bar", () => {
    expect(moneyGrid(112.4)).toEqual({ top: 200, lines: [0, 100, 200] });
    expect(moneyGrid(84.2)).toEqual({ top: 100, lines: [0, 50, 100] });
    expect(moneyGrid(0)).toEqual({ top: 1, lines: [0] });
  });
});

describe("usageColumns", () => {
  it("folds the kinds first, then sessions", () => {
    expect(usageColumns(1400)).toEqual({ kinds: true, sessions: true });
    expect(usageColumns(950)).toEqual({ kinds: false, sessions: true });
    expect(usageColumns(600)).toEqual({ kinds: false, sessions: false });
  });
  it("moves what gave way into the row's detail", () => {
    const r = { name: "x", sessions: 3, input: 1000, output: 2000, cache_read: 0, cache_write: 0 };
    expect(rowDetail(r, { kinds: false, sessions: true })).toBe("output 2.0k · input 1.0k · cache read 0 · cache write 0");
    expect(rowDetail(r, { kinds: false, sessions: false }).endsWith("3 sessions")).toBe(true);
    expect(rowDetail(r, { kinds: true, sessions: true })).toBe("");
  });
});

const sess = (id: string, o: Partial<UsageSession>): UsageSession => ({
  id, name: id, initiative: "organizer", task: "", task_title: "", role: "builder", model: "claude-opus", start: "", end: "", minutes: 60,
  running: false, input: 10, output: 10, cache_read: 70, cache_write: 10, tokens: 100, money: 1, cost_from: "record", ...o,
});

describe("forInitiative", () => {
  const all = [
    sess("b", { task: "usage-view", task_title: "Usage view", money: 3 }),
    sess("r", { task: "usage-view", task_title: "Usage view", role: "reviewer", running: true, money: 2 }),
    sess("f", { role: "fse", money: null }),
    sess("x", { initiative: "camp", money: 9 }),
  ];
  const v = forInitiative(all, "organizer");
  it("sums the initiative's own sessions", () => {
    expect(v.totals).toMatchObject({ money: 5, tokens: 300, sessions: 3, running: 1, without_cost: 1, hours: 3 });
    expect(v.sessions.map((s) => s.id)).toEqual(["b", "r", "f"]);
  });
  it("cuts by task with members and Not attributed last with its reason", () => {
    const t = v.cuts.task;
    expect(t.map((r) => r.name)).toEqual(["Usage view", "Not attributed"]);
    expect(t[0].members!.map((m) => m.role)).toEqual(["builder", "reviewer"]);
    expect(t[0].share).toBe(1);
    expect(t[1].reasons).toEqual([{ reason: "a fse session works on no single card", sessions: 1 }]);
  });
  it("keeps an empty Not attributed row in every cut", () => {
    expect(v.cuts.role.at(-1)).toMatchObject({ not_attributed: true, sessions: 0 });
    expect(v.cuts.role.map((r) => r.key)).toEqual(["builder", "reviewer", "fse", ""]);
  });
});

describe("agentsWeekLine", () => {
  it("speaks tokens only, and nothing for an initiative with none", () => {
    const rows = [{ ...row("organizer", 52.1, 3_200_000) }, row("", 1, 1, true)];
    expect(agentsWeekLine(rows, "organizer")).toBe("This week · 3.2M tokens");
    expect(agentsWeekLine(rows, "camp")).toBeNull();
    expect(agentsWeekLine(rows, "organizer")).not.toContain("$");
  });
});

describe("groupWaves", () => {
  const r = (key: string, money: number, o: Partial<UsageRow> = {}): UsageRow => ({ ...row(key, money, money * 1000), initiative: "organizer", ...o });
  const rows = [
    r("organizer/usage-ledger", 40, { cards: ["usage-ledger"], members: [{ id: "b1", name: "ul-build", role: "builder" }] }),
    r("organizer/wave:sup47", 10, { name: "sup47 · usage-ledger, usage-view", cards: ["usage-ledger", "usage-view"], members: [{ id: "s", name: "sup47", role: "supervisor" }] }),
    r("organizer/usage-view", 30, { cards: ["usage-view"] }),
    r("organizer/other", 35, { cards: ["other"] }),
    { ...row("", 5, 5, true) },
  ];
  const out = groupWaves(rows);
  it("puts a supervisor's cards under its wave and sums them", () => {
    expect(out.map((x) => x.key)).toEqual(["organizer/wave:sup47", "organizer/other", ""]);
    expect(out[0].money).toBe(80);
    expect(out[0].tokens).toBe(80_000);
    expect(out[0].sessions).toBe(3);
    expect(out[0].children!.map((c) => c.key)).toEqual(["organizer/usage-ledger", "organizer/usage-view"]);
    expect(out[0].own!.members![0].role).toBe("supervisor");
  });
  it("leaves single-card rows and Not attributed alone", () => {
    expect(out[1].children).toBeUndefined();
    expect(out.at(-1)!.not_attributed).toBe(true);
    expect(groupWaves([rows[0], rows[2]]).map((x) => x.key)).toEqual(["organizer/usage-ledger", "organizer/usage-view"]);
  });
  it("gives a card claimed by two waves to the later supervisor", () => {
    const two = groupWaves([...rows, r("organizer/wave:sup46", 50, { name: "sup46 · usage-ledger", cards: ["usage-ledger", "gone"] }),
      r("organizer/wave:sup48", 5, { name: "sup48 · usage-view, other", cards: ["usage-view", "other"] })]);
    const kids = (k: string) => two.find((x) => x.key === k)!.children!.map((c) => c.key);
    expect(kids("organizer/wave:sup48")).toEqual(["organizer/other", "organizer/usage-view"]);
    expect(kids("organizer/wave:sup47")).toEqual(["organizer/usage-ledger"]);
    expect(kids("organizer/wave:sup46")).toEqual([]);
  });
});
