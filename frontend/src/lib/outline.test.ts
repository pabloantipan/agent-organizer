import { describe, expect, it } from "vitest";
import type { model } from "../../wailsjs/go/models";
import {
  alsoIn, cardsInLaunchOrder, decisionName, firstWords, gemsOf, mergedWords, mergesAt, outlineRows, outsideWords, parentKey,
  roundSegments, roundsHeading, rowAfter, stageDecisions, stageGeometry, stageWord, staggerGems, stepAfter, waveSpan, waveWord, wavesByStage,
} from "./outline";
import { cardBar } from "./cardBar";

const stage = (o: Partial<model.Stage>) => ({ id: "", title: "", outcome: "", phase: "", exit: [], gates: [], appetite: "", target: "", done: "", current: false, ...o }) as unknown as model.Stage;
const round = (o: Partial<model.Round>) => ({ card: "a", kind: "build", start: "", end: "", result: "n/a", reviewer: "", reason: "", ...o }) as model.Round;
const wave = (o: Partial<model.Wave>) => ({ record: "r.md", date: "2026-09-24", dot: false, wave: 1, supervisor: "sup1", task: "t", cards: [], launched: "", merged: "", rounds: [], stages: [], ...o }) as unknown as model.Wave;
const dec = (o: Partial<model.Decision>) => ({ number: "0001", title: "T", status: "proposed", raised: "2026-10-01", ruled: "", ruled_by: "", stage: "", ...o }) as unknown as model.Decision;

// The fixture's shape: foundations done, the joins current (and written
// twice), the views planned.
const stages = [
  stage({ id: "foundations", title: "Foundations", done: "2026-08-15", target: "2026-08-15", gates: ["0001"], exit: [{ text: "a", met: "2026-08-10" }] as model.ExitItem[] }),
  stage({ id: "joins", title: "The joins", current: true, appetite: "two waves", exit: [{ text: "x", met: "" }, { text: "y", met: "" }] as model.ExitItem[] }),
  stage({ id: "joins", title: "The joins, twice" }),
  stage({ id: "views", title: "The views", appetite: "a week", gates: ["4"] }),
];
const w1 = wave({ record: "2026-09-24-a.md", stages: ["joins"], cards: ["w-review"], launched: "2026-09-24T10:05-03:00", merged: "2026-09-24T13:40-03:00",
  rounds: [
    round({ card: "w-review", start: "2026-09-24T10:05-03:00", end: "2026-09-24T11:10-03:00" }),
    round({ card: "w-review", kind: "review", start: "2026-09-24T11:12-03:00", end: "2026-09-24T11:30-03:00", result: "fail", reason: "gate row 2: the second row is not met" }),
    round({ card: "w-review", kind: "take", start: "2026-09-24T13:00-03:00", end: "2026-09-24T13:35-03:00", result: "pass" }),
  ] });
const w2 = wave({ record: "2026-09-28-b.md", stages: ["foundations", "joins"], cards: ["w-queued", "w-nogate", "w-founded"], launched: "2026-09-28T09:00-03:00", merged: "2026-09-28T12:15-03:00",
  rounds: [round({ card: "w-founded", start: "2026-09-28T09:00-03:00", end: "2026-09-28T10:20-03:00" }), round({ card: "w-nogate", start: "2026-09-28T09:30-03:00", end: "2026-09-28T10:45-03:00" })] });
const w3 = wave({ record: "2026-09-28-b.md", wave: 2, cards: ["w-later"], launched: "2026-10-05T16:00-03:00", rounds: [round({ card: "w-later", start: "2026-10-05T16:00-03:00" })] });
const dot = wave({ record: "2026-09-20-prose.md", date: "2026-09-20", dot: true, task: "the first run", supervisor: "" });
const cards = [{ slug: "w-review", stage: "joins" }, { slug: "alpha", stage: "joins" }, { slug: "w-founded", stage: "foundations" }, { slug: "w-later", stage: "" }, { slug: "beta", stage: "no-such" }];
const input = { stages, waves: [dot, w1, w2, w3], cards };
const kinds = (rows: ReturnType<typeof outlineRows>) => rows.map((r) => `${r.kind}${r.kind === "stage" ? r.index : ""}`);

describe("the detail steps", () => {
  it("step 1 is the current stage with its exit items, then Outside any stage", () => {
    expect(kinds(outlineRows(input, 1))).toEqual(["stage1", "exit", "exit", "outside"]);
  });
  it("step 1 says when the current stage has no exit items", () => {
    const s = [stage({ id: "a", current: true })];
    expect(outlineRows({ stages: s, waves: [], cards: [] }, 1).map((r) => r.kind === "note" && r.text)).toEqual([false, "No exit items written"]);
  });
  it("step 2 is every stage and no sub-rows", () => {
    expect(kinds(outlineRows(input, 2))).toEqual(["stage0", "stage1", "stage2", "stage3", "outside"]);
  });
  it("step 3 adds each stage's waves, a wave in two stages under each, and the empty ones say so", () => {
    const rows = outlineRows(input, 3);
    expect(kinds(rows)).toEqual(["stage0", "wave", "stage1", "wave", "wave", "stage2", "note", "stage3", "note", "outside", "wave", "wave"]);
    expect(rows.filter((r) => r.kind === "note").map((r) => r.kind === "note" && r.text)).toEqual(["Shares the id joins: its work is under stage 2", "No waves in this stage"]);
  });
  it("step 4 adds each wave's Rounds row and cards in launch order, and a stage's cards in no wave", () => {
    const rows = outlineRows(input, 4);
    const joins = rows.slice(rows.findIndex((r) => r.kind === "stage" && r.index === 1), rows.findIndex((r) => r.kind === "stage" && r.index === 2));
    expect(joins.map((r) => (r.kind === "card" ? `card:${r.slug}` : r.kind))).toEqual([
      "stage", "wave", "rounds", "card:w-review", "wave", "rounds", "card:w-founded", "card:w-nogate", "card:w-queued", "card:alpha",
    ]);
    const views = rows.slice(rows.findIndex((r) => r.kind === "stage" && r.index === 3), rows.findIndex((r) => r.kind === "outside"));
    expect(views.map((r) => (r.kind === "note" ? r.text : r.kind))).toEqual(["stage", "No waves in this stage", "No cards"]);
    const out = rows.slice(rows.findIndex((r) => r.kind === "outside"));
    expect(out.map((r) => (r.kind === "card" ? `card:${r.slug}` : r.kind))).toEqual(["outside", "wave", "rounds", "wave", "rounds", "card:w-later", "card:beta"]);
  });
  it("back to step 1 gives step 1's rows again", () => {
    expect(outlineRows(input, 1)).toEqual(outlineRows(input, 1));
  });
  it("a chevron opens a row one step deeper, and shuts one the step opened", () => {
    const opened = outlineRows(input, 1, new Map([["stage:1", true]]));
    expect(kinds(opened)).toEqual(["stage1", "exit", "exit", "wave", "wave", "outside"]);
    const w = opened.find((r) => r.kind === "wave")!;
    expect(kinds(outlineRows(input, 3, new Map([[w.key, true]]))).slice(2, 7)).toEqual(["stage1", "wave", "rounds", "card", "wave"]);
    expect(kinds(outlineRows(input, 3, new Map([["stage:1", false]]))).slice(2, 4)).toEqual(["stage1", "stage2"]);
  });
  it("no waves recorded at all says so under each stage", () => {
    const rows = outlineRows({ stages: [stage({ id: "a", current: true })], waves: [dot], cards: [] }, 3);
    expect(rows.filter((r) => r.kind === "note").map((r) => r.kind === "note" && r.text)).toEqual(["No waves recorded yet"]);
  });
  it("Outside any stage counts the cards with no roadmap stage, and is absent when there are none", () => {
    expect(outlineRows(input, 1).find((r) => r.kind === "outside")).toMatchObject({ count: 2, open: false });
    expect(outlineRows({ stages, waves: [w1], cards: [{ slug: "w-review", stage: "joins" }] }, 2).some((r) => r.kind === "outside")).toBe(false);
    expect(outsideWords(23)).toBe("Outside any stage · 23 cards");
    expect(outsideWords(1)).toBe("Outside any stage · 1 card");
  });
  it("with no roadmap, Outside any stage is the only row", () => {
    expect(kinds(outlineRows({ stages: [], waves: [w3], cards: [] }, 1))).toEqual(["outside"]);
  });
});

describe("waves", () => {
  it("join stages by id, the first of a duplicate, dots and stageless outside", () => {
    const { by, outside } = wavesByStage([dot, w1, w2, w3], stages);
    expect([...by.keys()]).toEqual([1, 0]);
    expect(by.get(1)).toEqual([w1, w2]);
    expect(outside).toEqual([dot, w3]);
    expect(alsoIn(w2, 0, stages)).toEqual(["The joins"]);
    expect(alsoIn(w1, 1, stages)).toEqual([]);
  });
  it("say merged, in flight, prose only", () => {
    expect([w1, w3, dot].map(waveWord)).toEqual(["merged", "in flight", "prose only"]);
  });
  it("span launch to merge, to now in flight, a dot its day", () => {
    const now = Date.parse("2026-10-06T12:00-03:00");
    expect(waveSpan(w1, now)).toEqual({ from: Date.parse("2026-09-24T10:05-03:00"), to: Date.parse("2026-09-24T13:40-03:00"), timed: true, open: false });
    expect(waveSpan(w3, now)).toMatchObject({ to: now, open: true });
    expect(waveSpan(dot, now)).toMatchObject({ from: new Date(2026, 8, 20).getTime(), to: new Date(2026, 8, 21).getTime(), timed: false });
    expect(waveSpan(wave({}), now)).toBeNull();
  });
  it("list cards in the order they were launched", () => {
    expect(cardsInLaunchOrder(w2)).toEqual(["w-founded", "w-nogate", "w-queued"]);
  });
});

describe("rounds", () => {
  const now = Date.parse("2026-10-06T12:00-03:00");
  it("are segments with words and whole hovers", () => {
    const s = roundSegments(w1, now);
    expect(s.map((x) => [x.tone, x.word])).toEqual([["built", "built"], ["fail", "fail · gate row 2"], ["take", "take"]]);
    expect(s[1].title).toContain("Round 2 · review · w-review");
    expect(s[1].title).toContain("11:12–11:30");
    expect(s[1].title).toContain("gate row 2: the second row is not met");
  });
  it("in flight run to now and say what they are doing", () => {
    const s = roundSegments(w3, now);
    expect(s[0]).toMatchObject({ open: true, to: now, word: "building" });
    expect(roundSegments(wave({ rounds: [round({ kind: "review", start: "2026-10-06T10:00-03:00" })] }), now)[0].word).toBe("in review");
  });
  it("merge when a segment is under 4 px", () => {
    const s = roundSegments(w1, now);
    const hours = (ms: number) => ((ms - s[0].from) / 3600000) * 64;
    const days = (ms: number) => ((ms - s[0].from) / 86400000) * 40;
    expect(mergesAt(s, hours)).toBe(false);
    expect(mergesAt(s, days)).toBe(true);
  });
  it("read in words", () => {
    const s = roundSegments(w1, now);
    expect(roundsHeading(s)).toBe("Rounds · 3, 1 failed");
    expect(roundsHeading([])).toBe("rounds not recorded");
    expect(mergedWords(s)).toEqual({ count: "3 rounds", fail: "1 fail" });
    expect(mergedWords(s.slice(0, 1))).toEqual({ count: "1 round", fail: "" });
  });
  it("cut the reason to its first words", () => {
    expect(firstWords("gate row 2: the second row is not met")).toBe("gate row 2");
    expect(firstWords("the bar is drawn one day early, again")).toBe("the bar is drawn");
    expect(firstWords("")).toBe("");
  });
});

describe("decisions", () => {
  const ds = [dec({ number: "0001", status: "ruled", raised: "2026-08-02", ruled: "2026-08-05", ruled_by: "acme" }), dec({ number: "0002", stage: "joins" }), dec({ number: "0004", status: "ruled", raised: "2026-09-01", ruled: "2026-09-03", ruled_by: "pablo" })];
  it("on a stage are its gates and the records that join it, on the first of a duplicate id", () => {
    expect(stageDecisions(stages, 0, ds).map((d) => d.number)).toEqual(["0001"]);
    expect(stageDecisions(stages, 1, ds).map((d) => d.number)).toEqual(["0002"]);
    expect(stageDecisions(stages, 2, ds)).toEqual([]);
    expect(stageDecisions(stages, 3, ds).map((d) => d.number)).toEqual(["0004"]);
  });
  it("are named with the record, ruled or waiting", () => {
    const now = new Date(2026, 9, 6);
    expect(decisionName(dec({ number: "0071", title: "Accept the time-zoom spec", status: "ruled", ruled: "2026-10-03", ruled_by: "pablo" }), now)).toBe("0071 Accept the time-zoom spec, ruled 3 Oct by pablo");
    expect(decisionName(dec({ number: "0002", title: "One machine", raised: "2026-09-20" }), now)).toBe("0002 One machine, raised 20 Sep, waiting");
  });
  it("draw hollow at raised and solid at ruled", () => {
    expect(gemsOf(ds[0]).map((g) => g.kind)).toEqual(["raised", "ruled"]);
    expect(gemsOf(ds[1]).map((g) => g.kind)).toEqual(["waiting"]);
  });
  it("stagger 4 px on one day, +N on the third past three", () => {
    const d = new Date(2026, 9, 1).getTime();
    const e = new Date(2026, 9, 2).getTime();
    expect(staggerGems([d, d, e, d, d, d])).toEqual([
      { dx: 0, shown: true, more: 0 }, { dx: 4, shown: true, more: 0 }, { dx: 0, shown: true, more: 0 },
      { dx: 8, shown: true, more: 2 }, { dx: 8, shown: false, more: 0 }, { dx: 8, shown: false, more: 0 },
    ]);
  });
});

describe("stages", () => {
  const today = new Date(2026, 9, 6).getTime();
  it("keep the Stages geometry: done, now to today, planned in a slot", () => {
    const g = stageGeometry(stages, [dec({ number: "0001", raised: "2026-08-02" })], today);
    expect(g.map((x) => x.state)).toEqual(["done", "current", "planned", "planned"]);
    expect(g[0]).toMatchObject({ start: new Date(2026, 7, 2).getTime(), end: new Date(2026, 7, 15).getTime(), slot: -1 });
    expect(g[1]).toMatchObject({ start: new Date(2026, 7, 15).getTime(), toToday: true, slot: 0 });
    expect(g[3].slot).toBe(2);
  });
  it("say their state in words", () => {
    const now = new Date(2026, 9, 6);
    expect(stageWord(stages[0], "done", now)).toBe("done 15 Aug");
    expect(stageWord(stages[1], "current", now)).toBe("now");
    expect(stageWord(stages[3], "planned", now)).toBe("planned · a week");
  });
});

describe("keys", () => {
  it("the switch is a radio group that wraps", () => {
    expect(stepAfter(1, "ArrowRight")).toBe(2);
    expect(stepAfter(4, "ArrowRight")).toBe(1);
    expect(stepAfter(1, "ArrowLeft")).toBe(4);
    expect(stepAfter(2, "Enter")).toBeNull();
  });
  it("up and down move between rows; left goes to the parent", () => {
    const rows = outlineRows(input, 4);
    const keys = rows.map((r) => r.key);
    expect(rowAfter(keys, keys[0], "ArrowUp")).toBe(keys[0]);
    expect(rowAfter(keys, keys[0], "ArrowDown")).toBe(keys[1]);
    const card = rows.find((r) => r.kind === "card")!;
    expect(parentKey(rows, card.key)).toBe(rows[rows.indexOf(card) - 2].key);
  });
});

describe("cardBar", () => {
  const today = new Date(2026, 9, 6).getTime();
  it("keeps the Cards rules", () => {
    expect(cardBar({ status: "now", start: "2026-09-12", due: "", branch_start: "", branch_last: "", updated: "" }, today)).toMatchObject({ openEnded: true, dot: false });
    expect(cardBar({ status: "next", start: "", due: "", branch_start: "", branch_last: "", updated: "2026-09-25" }, today)).toMatchObject({ dot: true });
    expect(cardBar({ status: "next", start: "", due: "2026-10-01", branch_start: "", branch_last: "", updated: "2026-09-25" }, today)).toMatchObject({ overdue: true, dot: false });
  });
});
