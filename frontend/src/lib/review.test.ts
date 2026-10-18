import { describe, expect, it } from "vitest";
import type { review, service } from "../../wailsjs/go/models";
import {
  allReviewed, countsLine, coverage, coverageLine, elapsedOf, factsBeside, filesOf, flagWords, groupName, inTextField, listWidth,
  makingLabel, movedLine, nextToReview, nothingToReview, partialLines, reviewable, rowName, screenState, shortName, walkOf, WORDS, worklist,
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
