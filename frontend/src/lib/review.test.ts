import { afterEach, describe, expect, it, vi } from "vitest";
import type { review, service } from "../../wailsjs/go/models";
import {
  allReviewed, countsLine, coverage, coverageLine, elapsedOf, factsBeside, filesOf, flagWords, groupName, inTextField, listWidth,
  makingLabel, movedLine, nextToReview, nothingToReview, partialLines, reviewable, rowName, screenState, shortName, walkOf, WORDS, worklist,
  afterASecond, affectedLine, makeOrigin, secondsSince, backTo, calledBy, callsOf, canSave, flagLook, markOf, progressDelay, shasOf, symbolDiff, testsOf,
} from "./review";

// review-map v2 FR-18 (docs/ux/specs/review-view.md §3.1, §3.2, §4, §5):
// the worklist's groups and order, the header's counts and lines, Next to
// review, and every state's words, against maps shaped as revmap.json is.

type N = Partial<review.Node> & { id: string };
const node = (n: N): review.Node => ({
  level: "symbol", parent: "", kind: "function", lang: "go", file: "", change: "modified",
  evidence: { tests: [] }, flags: [], review: { state: "unreviewed" }, ...n,
} as unknown as review.Node);
const pkg = (id: string, file: string) => node({ id, level: "package", kind: "package", file });

const revmap = (nodes: review.Node[], over: Partial<review.RevMap> = {}): review.RevMap => {
  const sym = nodes.filter((n) => n.level === "symbol" && n.change !== "affected");
  return {
    version: "0", initiative: "init-a", target: "rv-fixture", base: "da36d87631e1", head: "2bd87dba33b1", source: "go/types, typescript",
    nodes, edges: [], mismatches: [], reconciled: true, reconciliation: "change-check rv-fixture",
    stats: { packages: 0, changed: sym.filter((n) => n.kind !== "test").length, changed_tests: sym.filter((n) => n.kind === "test").length, affected: 0, untested: 0, edges: 0 },
    ...over,
  } as unknown as review.RevMap;
};

// The fixture's map (fixture-home.sh --review, organizer review init-a rv-fixture).
const fixture = revmap([
  pkg("go:example.com/inita/svc", "svc"),
  pkg("ts:web/src", "web/src"),
  node({ id: "go:example.com/inita/svc.Greet", parent: "go:example.com/inita/svc", file: "svc/greet.go", range_head: [3, 6], range_base: [3, 6], evidence: { tests: ["svc/greet_test.go::TestGreet"] } as review.Evidence }),
  node({ id: "ts:web/src/format.ts#formatName", parent: "ts:web/src", lang: "ts", file: "web/src/format.ts", range_head: [1, 4], range_base: [1, 4], flags: ["untested", "undeclared"] }),
], { mismatches: [{ type: "changed_not_declared", node: "ts:web/src/format.ts#formatName" }] as review.Mismatch[] });

// A bigger one: three packages, one flagged inside its package, tests, an
// affected neighbour, a declared line with no node.
const P = "go:x/internal/service", C = "go:x/internal/cli", S = "go:x/shared";
const big = revmap([
  pkg(P, "internal/service"), pkg(C, "internal/cli"), pkg(S, "shared"),
  node({ id: `${C}.crewCmd`, parent: C, file: "internal/cli/crew.go", range_head: [10, 20] }),
  node({ id: `${C}.runCmd`, parent: C, file: "internal/cli/run.go", range_head: [5, 9] }),
  node({ id: `${P}.queueLaunch`, parent: P, file: "internal/service/launch.go", range_head: [120, 140] }),
  node({ id: `${P}.runLaunches`, parent: P, file: "internal/service/launch.go", range_head: [40, 118] }),
  node({ id: `${P}.Service.launchProbe`, parent: P, file: "internal/service/service.go", range_head: [1, 9], flags: ["untested"], change: "added" }),
  node({ id: `${S}.Upload`, parent: S, file: "shared/upload.go", range_head: [1, 30], flags: ["undeclared"] }),
  node({ id: `${P}.TestRunLaunches`, parent: P, kind: "test", file: "internal/service/launch_test.go", change: "added" }),
  node({ id: `${P}.CreateCrew`, parent: P, file: "internal/service/crew.go", change: "affected" }),
], { mismatches: [{ type: "declared_not_changed", file: "internal/cli/stop.go", symbol: "stopCmd" }, { type: "changed_not_declared", node: `${S}.Upload` }] as review.Mismatch[] });

const marks = (m: Record<string, string>, changed: string[] = []): review.Marks => ({
  initiative: "init-a", card: "rv-fixture", head: "2bd87dba33b1",
  marks: Object.entries(m).map(([symbol, state]) => ({ symbol, state, note: "", by: "pablo", at: "", hash: "" })),
  changed: changed.map((symbol) => ({ symbol, state: "reviewed", note: "", by: "pablo", at: "", hash: "" })),
} as unknown as review.Marks);

describe("the worklist's groups (§3.2)", () => {
  it("puts the undeclared in Must visit, then packages by size, then Declared, not changed, then Tests changed, collapsed", () => {
    const g = worklist(big);
    expect(g.map((x) => [x.title, x.rows.length, x.collapsed])).toEqual([
      ["Must visit", 1, false],
      ["internal/service", 3, false],
      ["internal/cli", 2, false],
      ["Declared, not changed", 1, false],
      ["Tests changed", 1, true],
    ]);
    expect(g.flatMap((x) => x.rows).some((r) => r.id.endsWith("CreateCrew"))).toBe(false); // affected nodes are not rows
  });

  it("orders inside a group flagged first, then risk high to low, then file order", () => {
    const svc = worklist(big)[1].rows.map((r) => r.name);
    expect(svc).toEqual(["Service.launchProbe", "runLaunches", "queueLaunch"]);
    const risky = revmap([
      pkg(P, "internal/service"),
      node({ id: `${P}.a`, parent: P, file: "a.go", risk: "low" }),
      node({ id: `${P}.b`, parent: P, file: "b.go", risk: "high" }),
      node({ id: `${P}.c`, parent: P, file: "c.go" }),
    ]);
    expect(worklist(risky)[0].rows.map((r) => r.name)).toEqual(["b", "a", "c"]);
  });

  it("names rows by the symbol after its package; Must visit carries the package", () => {
    const g = worklist(fixture);
    expect(g.map((x) => x.title)).toEqual(["Must visit", "svc"]);
    expect(g[0].rows[0].name).toBe("format.formatName");
    expect(g[1].rows[0].name).toBe("Greet");
    expect(shortName(big.nodes.find((n) => n.id === `${S}.Upload`)!, true)).toBe("shared.Upload");
  });

  it("draws each flag as the design's words", () => {
    expect(["undeclared", "outside_footprint", "declared_not_changed", "untested"].map(flagWords)).toEqual([
      "not in the card's declared changes", "outside the card's footprint", "declared, not changed", "no direct test",
    ]);
  });

  it("names a row and a group head as §5 says", () => {
    const g = worklist(big, marks({ [`${P}.runLaunches`]: "reviewed" }));
    const svc = g[1];
    expect(rowName(svc.rows[0])).toBe("Service.launchProbe, added, no direct test");
    expect(rowName(svc.rows[1])).toBe("runLaunches, modified, reviewed");
    expect(groupName(svc)).toBe("internal/service, 3 symbols, 1 reviewed");
  });

  it("a mark that did not carry reads changed since you reviewed, with no mark", () => {
    const g = worklist(fixture, marks({}, ["go:example.com/inita/svc.Greet"]));
    const r = g[1].rows[0];
    expect([r.mark, r.changedSince]).toEqual(["", true]);
    expect(rowName(r)).toBe("Greet, modified, changed since you reviewed");
  });
});

describe("the header (§3.1)", () => {
  it("V-R2: the fixture map reads Reviewed 0 of 2 · 1 must-visit left", () => {
    expect(coverageLine(coverage(fixture))).toBe("Reviewed 0 of 2 · 1 must-visit left");
  });

  it("must-visit left is gone once the undeclared one is marked; tests are not counted", () => {
    expect(coverageLine(coverage(fixture, marks({ "ts:web/src/format.ts#formatName": "question" })))).toBe("Reviewed 1 of 2");
    expect(coverage(big).of).toBe(6);
  });

  it("adds the high-risk count only when a node carries risk", () => {
    const m = revmap([node({ id: "go:p.a", parent: "go:p", risk: "high" }), node({ id: "go:p.b", parent: "go:p", risk: "high" }), node({ id: "go:p.c", parent: "go:p" })]);
    expect(coverageLine(coverage(m, marks({ "go:p.a": "reviewed" })))).toBe("Reviewed 1 of 3 · high risk 1 of 2");
  });

  it("says the counts once: head ← base, symbols changed, tests", () => {
    expect(countsLine(fixture)).toBe("2bd87db ← da36d87 · 2 symbols changed, 0 tests");
    expect(countsLine(big)).toBe("2bd87db ← da36d87 · 6 symbols changed, 1 test");
  });

  it("V-R9: a map with no reconciliation says so, one line per reason", () => {
    const partial = revmap(fixture.nodes, { reconciled: false, reconciliation: "change-check not on PATH", problems: ["ts: node is not on PATH, so no TypeScript symbols were read"] });
    expect(partialLines(partial)).toEqual([
      "Not checked against the card's declared changes: change-check not on PATH.",
      "ts: node is not on PATH, so no TypeScript symbols were read.",
    ]);
    expect(partialLines(fixture)).toEqual([]);
  });
});

describe("Next to review (§3.1, V-R3)", () => {
  const g = worklist(big);
  const walk = walkOf(g).map((r) => r.id);

  it("walks Must visit, then packages by size, flagged first, and never tests or declared lines", () => {
    expect(walk).toEqual([`${S}.Upload`, `${P}.Service.launchProbe`, `${P}.runLaunches`, `${P}.queueLaunch`, `${C}.crewCmd`, `${C}.runCmd`]);
  });

  it("N from the top is the first; N again the next; Shift+N back one", () => {
    const a = nextToReview(g, "", 1)!;
    const b = nextToReview(g, a, 1)!;
    expect([a, b]).toEqual([walk[0], walk[1]]);
    expect(nextToReview(g, b, -1)).toBe(a);
  });

  it("skips marked symbols and wraps to the top", () => {
    const m = worklist(big, marks({ [`${P}.Service.launchProbe`]: "reviewed", [`${S}.Upload`]: "reviewed" }));
    expect(nextToReview(m, `${S}.Upload`, 1)).toBe(`${P}.runLaunches`);
    expect(nextToReview(m, `${C}.runCmd`, 1)).toBe(`${P}.runLaunches`);
    expect(nextToReview(m, `${P}.runLaunches`, -1)).toBe(`${C}.runCmd`);
  });

  it("is null when every symbol is marked", () => {
    const all = Object.fromEntries(walk.map((id) => [id, "reviewed"]));
    expect(nextToReview(worklist(big, marks(all)), "", 1)).toBeNull();
  });
});

describe("the states' words (§4)", () => {
  const status = (state: string, make: Partial<service.ReviewMake> | null = null) => ({ initiative: "init-a", card: "rv-fixture", state, head: "9e0f3c1aa", base: "", map_head: "4d2a91baa", make } as unknown as service.ReviewStatus);

  it("no map, making, failed, moved, the map", () => {
    expect(screenState(null, null)).toBe("loading");
    expect(screenState(status("none"), null)).toBe("none");
    expect(screenState(status("none", { state: "making" }), null)).toBe("making");
    expect(screenState(status("none"), { state: "failed" } as service.ReviewMake)).toBe("failed");
    expect(screenState(status("none"), { state: "stopped" } as service.ReviewMake)).toBe("none");
    expect(screenState(status("moved"), { state: "making" } as service.ReviewMake)).toBe("moved");
    expect(screenState(status("map"), null)).toBe("map");
    expect(screenState(status("missing"), null)).toBe("missing");
  });

  it("copies the design's words", () => {
    expect(WORDS.noMap).toBe("No review map for this change yet.");
    expect(WORDS.makeMap).toBe("Make the map");
    expect(makingLabel(2)).toBe("Making the map · 2 s");
    expect(movedLine("4d2a91b0000", "9e0f3c1ffff")).toBe("The branch moved since this map (4d2a91b → 9e0f3c1).");
    expect(WORDS.makeAgain).toBe("Make it again");
    expect([WORDS.tryAgain, WORDS.copyCommand]).toEqual(["Try again", "Copy the command"]);
    expect(WORDS.changedSince).toBe("changed since you reviewed");
    expect(WORDS.nothing).toBe("Nothing to review at symbol level: the change touches no Go or TS definition.");
  });

  it("the counter counts from started and never drops below elapsed", () => {
    const started = "2026-10-18T10:00:00Z";
    expect(elapsedOf({ started, elapsed: 0 }, Date.parse(started) + 4200)).toBeCloseTo(4.2);
    expect(Math.floor(elapsedOf({ started: "", elapsed: 7 }, 0))).toBe(7);
  });

  it("a docs-only change has nothing at symbol level", () => {
    const docs = revmap([pkg("go:x/doc", "doc")]);
    expect(nothingToReview(docs)).toBe(true);
    expect(filesOf(docs)).toEqual(["doc"]);
    expect(nothingToReview(fixture)).toBe(false);
  });

  it("all reviewed reads n of n", () => {
    const c = coverage(fixture, marks({ "go:example.com/inita/svc.Greet": "reviewed", "ts:web/src/format.ts#formatName": "blocked" }));
    expect([coverageLine(c), allReviewed(c)]).toEqual(["Reviewed 2 of 2", true]);
    expect(allReviewed(coverage(fixture))).toBe(false);
  });
});

describe("where it opens and its widths (§2, §3.4)", () => {
  it("V-R1: a local card whose change resolves; not missing, not another machine's", () => {
    expect(reviewable(true, { state: "none" })).toBe(true);
    expect(reviewable(true, { state: "moved" })).toBe(true);
    expect(reviewable(true, { state: "missing" })).toBe(false);
    expect(reviewable(false, { state: "map" })).toBe(false);
    expect(reviewable(true, null)).toBe(false);
  });

  it("V-R11: 280 px with the facts under the diff below 1440, 300 beside from 1440", () => {
    expect([listWidth(1024), factsBeside(1024)]).toEqual([280, false]);
    expect([listWidth(1439), listWidth(1440), factsBeside(1440)]).toEqual([280, 300, true]);
  });

  it("N and Escape are a text field's own there", () => {
    const el = (tagName: string, type = "") => ({ tagName, type, isContentEditable: false }) as unknown as Element;
    expect([el("TEXTAREA"), el("INPUT", "text"), el("SELECT")].map(inTextField)).toEqual([true, true, true]);
    expect([el("BUTTON"), el("INPUT", "radio"), el("LI"), null].map(inTextField)).toEqual([false, false, false, false]);
  });
});

describe("V-R13 (FR-22): the TS qualifier", () => {
  const ts = (file: string, name: string, flags = ["undeclared"]) => node({ id: `ts:${file}#${name}`, parent: `ts:${file.split("/").slice(0, -1).join("/")}`, lang: "ts", file, flags });
  it("is the file stem; an index file takes its folder", () => {
    expect(shortName(ts("web/src/format.ts", "formatName"), true)).toBe("format.formatName");
    expect(shortName(ts("lib/index.ts", "formatName"), true)).toBe("lib.formatName");
    expect(shortName(ts("web/lib/index.tsx", "formatName"), true)).toBe("lib.formatName");
  });
  it("two rows of one group that would read the same both carry their parent folder", () => {
    const m = revmap([pkg("ts:lib", "lib"), pkg("ts:components", "components"), ts("lib/format.ts", "formatName"), ts("components/format.ts", "formatName"), ts("web/util.ts", "formatName")]);
    const must = worklist(m).find((g) => g.kind === "must")!;
    expect(must.rows.map((r) => r.name).sort()).toEqual(["components/format.formatName", "lib/format.formatName", "util.formatName"]);
  });
  it("two index files whose folders read the same carry the folder above", () => {
    const m = revmap([ts("a/lib/index.ts", "x"), ts("b/lib/index.ts", "x")]);
    expect(worklist(m)[0].rows.map((r) => r.name).sort()).toEqual(["a/lib.x", "b/lib.x"]);
  });
  it("the row's description is the full path", () => {
    const rows = worklist(fixture).flatMap((g) => g.rows);
    expect(rows.map((r) => r.path)).toEqual(["web/src/format.ts", "svc/greet.go"]);
  });
});

describe("V-R4: the symbol's scoped diff", () => {
  it("base range against head range, head line numbers, + and − in the gutter", () => {
    const base = { first: 1, lines: ["package svc", "", "// Greet", "func Greet(name string) string {", '\treturn "hello " + name', "}"] };
    const head = { first: 1, lines: ["package svc", "", "// Greet", "func Greet(name string) string {", '\treturn "hello, " + name + "!"', "}"] };
    const d = symbolDiff(base, head);
    expect(d.map((l) => l.sign).join("")).toBe("    −+ ");
    expect(d.find((l) => l.sign === "+")).toEqual({ sign: "+", text: '\treturn "hello, " + name + "!"', line: 5 });
    expect(d.find((l) => l.sign === "−")).toEqual({ sign: "−", text: '\treturn "hello " + name', line: null });
    expect(d.at(-1)).toEqual({ sign: " ", text: "}", line: 6 });
  });
  it("an added symbol is all +, a deleted one all −", () => {
    expect(symbolDiff(null, { first: 10, lines: ["a", "b"] })).toEqual([{ sign: "+", text: "a", line: 10 }, { sign: "+", text: "b", line: 11 }]);
    expect(symbolDiff({ first: 3, lines: ["a"] }, null)).toEqual([{ sign: "−", text: "a", line: null }]);
  });
  it("reads a node at its repo's shas in a map of several repos", () => {
    const m = revmap([], { repos: [{ name: "api", base: "b1", head: "h1", from: "" }, { name: "web", base: "b2", head: "h2", from: "" }] as review.RepoPair[] });
    expect(shasOf(m, node({ id: "x", file: "web/src/a.ts" }))).toEqual({ base: "b2", head: "h2" });
    expect(shasOf(fixture, fixture.nodes[2])).toEqual({ base: "da36d87631e1", head: "2bd87dba33b1" });
  });
});

describe("V-R5: the flags in the design's words and looks", () => {
  it("untested reads no direct test, muted; undeclared reads not in the card's declared changes, amber", () => {
    expect([flagWords("untested"), flagLook("untested")]).toEqual(["no direct test", "muted"]);
    expect([flagWords("undeclared"), flagLook("undeclared")]).toEqual(["not in the card's declared changes", "amber"]);
    expect([flagWords("outside_footprint"), flagLook("outside_footprint")]).toEqual(["outside the card's footprint", "amber"]);
    expect([flagWords("declared_not_changed"), flagLook("declared_not_changed")]).toEqual(["declared, not changed", "dashed"]);
  });
});

describe("V-R6: Called by, Calls and the affected view", () => {
  const G = "go:example.com/inita/svc.Greet", W = "go:example.com/inita/svc.Welcome", L = "go:example.com/inita/svc.lower";
  const m = revmap([
    pkg("go:example.com/inita/svc", "svc"),
    node({ id: G, parent: "go:example.com/inita/svc", file: "svc/greet.go" }),
    node({ id: W, parent: "go:example.com/inita/svc", file: "svc/welcome.go", change: "affected" }),
    node({ id: L, parent: "go:example.com/inita/svc", file: "svc/lower.go", change: "affected" }),
  ], { edges: [{ from: W, to: G, kind: "uses", change: "unchanged", source: "" }, { from: G, to: L, kind: "uses", change: "unchanged", source: "" }, { from: "go:example.com/inita/svc", to: "go:x/other", kind: "uses", change: "unchanged", source: "" }] as review.Edge[] });
  const n = (id: string) => m.nodes.find((x) => x.id === id)!;
  it("Called by the users, Calls the used; package edges are not symbols", () => {
    expect(calledBy(m, G).map((x) => x.id)).toEqual([W]);
    expect(callsOf(m, G).map((x) => x.id)).toEqual([L]);
  });
  it("an affected symbol says why it is shown, and back names the changed one", () => {
    expect(affectedLine(m, n(W), n(G))).toBe("unchanged · shown because it calls svc.Greet");
    expect(affectedLine(m, n(L), n(G))).toBe("unchanged · shown because svc.Greet calls it");
    expect(backTo(n(G))).toBe("← back to svc.Greet");
  });
  it("Tests: each test that names it, linked when the test changed in this map", () => {
    const t = node({ id: "go:example.com/inita/svc.TestGreet", kind: "test", file: "svc/greet_test.go" });
    const g = node({ id: G, evidence: { tests: ["svc/greet_test.go::TestGreet", "svc/x_test.go::TestOther"] } as review.Evidence });
    expect(testsOf(revmap([g, t]), g)).toEqual([{ label: "svc/greet_test.go TestGreet", node: t }, { label: "svc/x_test.go TestOther", node: null }]);
    expect(testsOf(fixture, fixture.nodes[2])).toEqual([{ label: "svc/greet_test.go TestGreet", node: null }]);
  });
});

describe("V-R8: the mark", () => {
  it("Save needs a mark, and for Question and Blocked a note", () => {
    expect(canSave("", "x")).toBe(false);
    expect(canSave("reviewed", "")).toBe(true);
    expect(canSave("question", "")).toBe(false);
    expect(canSave("question", "  ")).toBe(false);
    expect(canSave("question", "why?")).toBe(true);
    expect(canSave("blocked", "")).toBe(false);
    expect(canSave("blocked", "the gate is wrong")).toBe(true);
    // FR-24: the mark as saved has nothing to save; a change does
    expect(canSave("reviewed", "", { state: "reviewed", note: "" })).toBe(false);
    expect(canSave("reviewed", " ok ", { state: "reviewed", note: "ok" })).toBe(false);
    expect(canSave("reviewed", "ok, after all", { state: "reviewed", note: "ok" })).toBe(true);
    expect(canSave("question", "why?", { state: "reviewed", note: "why?" })).toBe(true);
  });
  it("the panel starts from the saved mark and note", () => {
    const mk = { marks: [{ symbol: "a", state: "question", note: "why?" }], changed: [] } as unknown as review.Marks;
    expect(markOf(mk, "a")).toEqual({ state: "question", note: "why?" });
    expect(markOf(mk, "b")).toEqual({ state: "", note: "" });
  });
  it("the v3 line and the buttons in the design's words", () => {
    expect([WORDS.reviewedNext, WORDS.save, WORDS.v3, WORDS.builderSays]).toEqual(["Reviewed, next", "Save", "Kept in Deltagos; asking the supervisor comes later.", "The builder says"]);
  });
});

describe("V-R14 (FR-23): no flash, with fake timers", () => {
  afterEach(() => { vi.useRealTimers(); });
  // As the binding returns it: Go's RFC3339, cut to the whole second
  // (internal/service/review.go), with the press at .950 s of that second.
  const PRESS = Date.parse("2026-10-18T10:00:00.950Z");
  const made = { started: "2026-10-18T10:00:00Z", elapsed: 0 };
  const pressAndSee = () => {
    const pressedAt = Date.now();
    vi.advanceTimersByTime(5); // MakeReview's round trip
    return makeOrigin(made, Date.now(), pressedAt);
  };
  it("the origin is the press, not Go's whole second", () => {
    vi.useFakeTimers({ now: PRESS });
    expect(pressAndSee()).toBe(PRESS);
    expect(progressDelay(PRESS, PRESS + 5)).toBe(995);
  });
  it("a make that ends at 900 ms after the press never shows the counter or Stop", () => {
    vi.useFakeTimers({ now: PRESS });
    const show = vi.fn();
    const cancel = afterASecond(pressAndSee(), show);
    vi.advanceTimersByTime(895);
    cancel(); // the make's end, 900 ms after the press
    vi.advanceTimersByTime(5_000);
    expect(show).not.toHaveBeenCalled();
  });
  it("one that runs to 1500 ms shows them 1 s after the press, counting 1 s, and show moves no focus", () => {
    vi.useFakeTimers({ now: PRESS });
    // show is the screen's setProgress(true): it only redraws. This file runs
    // with no document, so a timer that reached for focus would throw here.
    const show = vi.fn();
    const origin = pressAndSee();
    const cancel = afterASecond(origin, show);
    vi.advanceTimersByTime(994);
    expect(show).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(show).toHaveBeenCalledTimes(1);
    expect(Date.now() - PRESS).toBe(1000);
    expect(secondsSince(origin)).toBe(1);
    vi.advanceTimersByTime(500);
    cancel();
    expect(show).toHaveBeenCalledTimes(1);
    expect(typeof document).toBe("undefined");
  });
  it("a make first seen here (a reload) counts from the latest instant it can have started", () => {
    // seen at .950 of its second: it may have started just now, so the second counts from the sight
    expect(makeOrigin(made, PRESS)).toBe(Date.parse("2026-10-18T10:00:00.950Z"));
    expect(makeOrigin(made, Date.parse("2026-10-18T10:00:00.300Z"))).toBe(Date.parse("2026-10-18T10:00:00.300Z"));
    // reopened after its first second: shows at once
    const later = Date.parse("2026-10-18T10:00:05.200Z");
    expect(progressDelay(makeOrigin({ started: "2026-10-18T10:00:00Z", elapsed: 5 }, later), later)).toBe(0);
    expect(progressDelay(makeOrigin({ started: "2026-10-18T10:00:05Z", elapsed: 0 }, later), later)).toBe(1000);
    expect(progressDelay(makeOrigin({ started: "", elapsed: 3 }, later), later)).toBe(0);
  });
  it("the counter never reads 0 s once shown", () => {
    expect(secondsSince(1000, 1000)).toBe(1);
    expect(secondsSince(1000, 3999)).toBe(2);
  });
});
