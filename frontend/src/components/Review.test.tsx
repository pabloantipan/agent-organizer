import { renderToStaticMarkup } from "react-dom/server";
import { createRef } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { review, service } from "../../wailsjs/go/models";
// @ts-expect-error node:fs has no type declarations in this tsconfig
import { readFileSync } from "node:fs";

// V-S (review-map v2 FR-18; docs/ux/specs/review-view.md §4): each state's
// words, exactly, as the screen draws them. No DOM library is a dependency,
// so the pure view renders to markup; Copy the command is checked by its
// label and a stubbed clipboard, never the real one.

const clip = vi.fn((_: string) => Promise.resolve(true));
vi.mock("../../wailsjs/go/main/App", () => ({ MakeReview: vi.fn(), ReviewMap: vi.fn(), ReviewMarks: vi.fn(), ReviewStatus: vi.fn(), StopReview: vi.fn(), MarkReview: vi.fn(), ReviewFile: vi.fn(), ReviewAddressee: vi.fn(), AskReview: vi.fn() }));
vi.mock("../../wailsjs/runtime/runtime", () => ({ ClipboardSetText: (t: string) => clip(t), EventsOn: () => () => undefined }));
vi.mock("../stores/board.store", () => ({ useBoard: () => ({}) }));

const { ReviewView, copyCommand } = await import("./Review");
const { afterASecond, makeOrigin } = await import("../lib/review");
const { Where } = await import("./TopBar");

const node = (n: Partial<review.Node> & { id: string }) => ({
  level: "symbol", parent: "", kind: "function", lang: "go", file: "", change: "modified",
  evidence: { tests: [] }, flags: [], review: { state: "unreviewed" }, ...n,
}) as unknown as review.Node;

const fixture = {
  version: "0", initiative: "init-a", target: "rv-fixture", base: "da36d87631e1", head: "2bd87dba33b1", source: "go/types",
  nodes: [
    node({ id: "go:example.com/inita/svc", level: "package", kind: "package", file: "svc" }),
    node({ id: "ts:web/src", level: "package", kind: "package", file: "web/src" }),
    node({ id: "go:example.com/inita/svc.Greet", parent: "go:example.com/inita/svc", file: "svc/greet.go", range_head: [3, 6] }),
    node({ id: "ts:web/src/format.ts#formatName", parent: "ts:web/src", file: "web/src/format.ts", flags: ["untested", "undeclared"] }),
  ],
  edges: [], mismatches: [], reconciled: true, reconciliation: "change-check rv-fixture",
  stats: { packages: 2, changed: 2, changed_tests: 0, affected: 0, untested: 1, edges: 0 },
} as unknown as review.RevMap;

const status = (state: string, make: Partial<service.ReviewMake> | null = null) =>
  ({ initiative: "init-a", card: "rv-fixture", state, head: "9e0f3c1ffff", base: "da36d87", map_head: "4d2a91b0000", make, reason: "" }) as unknown as service.ReviewStatus;
const marks = (m: Record<string, string>) => ({ initiative: "init-a", card: "rv-fixture", head: "", marks: Object.entries(m).map(([symbol, state]) => ({ symbol, state })), changed: [] }) as unknown as review.Marks;

const noop = () => undefined;
function view(p: { status: service.ReviewStatus | null; make?: service.ReviewMake | null; map?: review.RevMap | null; marks?: review.Marks | null; symbol?: string; progress?: boolean; origin?: number; from?: string; via?: "calledBy" | "calls"; to?: { seat: string; why: string }; said?: string }) {
  return renderToStaticMarkup(
    <ReviewView status={p.status} make={p.make ?? null} map={p.map ?? null} marks={p.marks ?? null} error={null} symbol={p.symbol ?? ""} active="" setActive={noop}
      onBack={noop} onStep={noop} onOpen={noop} onMake={noop} onStop={noop} makeBtn={createRef()} title={createRef()} said={p.said ?? ""} progress={p.progress} origin={p.origin}
      panel={p.from === undefined ? undefined : { initiative: "init-a", card: "rv-fixture", head: "", from: p.from, via: p.via, to: p.to, onBack: noop, onMarks: noop, onNext: noop }} />,
  );
}
const text = (html: string) => html.replace(/<[^>]+>/g, " ").replace(/&#x27;/g, "'").replace(/&gt;/g, ">").replace(/\s+/g, " ");

describe("V-S: every §4 state in the design's words", () => {
  it("no map: the line and Make the map, primary", () => {
    const h = view({ status: status("none") });
    expect(text(h)).toContain("No review map for this change yet.");
    expect(h).toMatch(/<button class="primary"[^>]*>Make the map<\/button>/);
  });

  it("making: the counter on the busy button, no spinner, and Stop", () => {
    const started = new Date(Date.now() - 2_000).toISOString();
    const h = view({ status: status("none"), make: { state: "making", started, elapsed: 2 } as service.ReviewMake, progress: true, origin: Date.now() - 2_000 });
    expect(h).toMatch(/<button class="primary" aria-disabled="true"[^>]*>Making the map · 2 s<\/button>/);
    expect(h).toContain(">Stop</button>");
    expect(h).not.toMatch(/spinner|spin/);
  });

  it("making, its first second (FR-23): only the busy button, Making the map…, no counter and no Stop", () => {
    const h = view({ status: status("none"), make: { state: "making", started: new Date().toISOString(), elapsed: 0 } as service.ReviewMake });
    expect(h).toMatch(/<button class="primary" aria-disabled="true"[^>]*>Making the map…<\/button>/);
    expect(h).not.toContain(">Stop</button>");
    expect(h).not.toContain("Making the map ·");
  });

  it("making over a moved map: Make it again turns Making the map…, Stop only with the progress line", () => {
    const make = { state: "making", started: new Date().toISOString(), elapsed: 0 } as service.ReviewMake;
    expect(view({ status: status("moved"), map: fixture, make })).toMatch(/aria-disabled="true"[^>]*>Making the map…<\/button><\/span>/);
    expect(view({ status: status("moved"), map: fixture, make, progress: true, origin: Date.now() - 1_000 })).toContain(">Stop</button>");
  });

  describe("V-R14 (FR-23) as drawn: Go's whole-second started, the press at .950 s", () => {
    afterEach(() => { vi.useRealTimers(); });
    const PRESS = Date.parse("2026-10-18T10:00:00.950Z");
    const make = { state: "making", started: "2026-10-18T10:00:00Z", elapsed: 0 } as service.ReviewMake;
    // The screen's sequence (Review.tsx): the press is taken, MakeReview
    // answers, the origin is set and afterASecond arms setProgress.
    const press = () => {
      vi.useFakeTimers({ now: PRESS });
      const pressedAt = Date.now();
      vi.advanceTimersByTime(5);
      const origin = makeOrigin(make, Date.now(), pressedAt);
      const s = { progress: false, origin, cancel: () => undefined as void };
      s.cancel = afterASecond(origin, () => { s.progress = true; });
      return s;
    };
    const drawn = (s: { progress: boolean; origin: number }, m: service.ReviewMake | null = make) => view({ status: status("none"), make: m, progress: s.progress, origin: s.origin });
    it("a make ending 900 ms after the press never draws the counter or Stop", () => {
      const s = press();
      for (const t of [45, 500, 895]) {
        vi.advanceTimersByTime(t - (Date.now() - PRESS - 5));
        const h = drawn(s);
        expect(h).toContain(">Making the map…</button>");
        expect(h).not.toContain("Making the map ·");
        expect(h).not.toContain(">Stop</button>");
      }
      s.cancel();
      vi.advanceTimersByTime(5_000);
      const h = drawn(s, { ...make, state: "done", elapsed: 0 } as service.ReviewMake);
      expect(s.progress).toBe(false);
      expect(h).not.toContain("Making the map ·");
      expect(h).not.toContain(">Stop</button>");
    });
    it("one ending at 1500 ms draws them from 1 s after the press, the counter at 1 s, focus unmoved", () => {
      const s = press();
      vi.advanceTimersByTime(994);
      expect(drawn(s)).not.toContain(">Stop</button>");
      vi.advanceTimersByTime(1);
      expect(Date.now() - PRESS).toBe(1000);
      const h = drawn(s);
      expect(h).toContain(">Making the map · 1 s</button>");
      expect(h).not.toContain("· 0 s");
      expect(h).toContain(">Stop</button>");
      vi.advanceTimersByTime(500);
      expect(drawn(s)).toContain(">Making the map · 1 s</button>");
      s.cancel();
      // no document in this run: nothing the timer did could have moved focus
      expect(typeof document).toBe("undefined");
    });
  });

  it("failed: the reason, Try again and Copy the command", () => {
    const make = { state: "failed", error: "change-check failed: exit status 2", command: "organizer review init-a rv-fixture --json" } as service.ReviewMake;
    const h = view({ status: status("none"), make });
    expect(text(h)).toContain("change-check failed: exit status 2");
    expect(h).toContain(">Try again</button>");
    expect(h).toContain(">Copy the command</button>");
  });

  it("Copy the command writes the command to the clipboard it is given", async () => {
    clip.mockClear();
    expect(await copyCommand("organizer review init-a rv-fixture --json")).toBe(true);
    expect(clip).toHaveBeenCalledWith("organizer review init-a rv-fixture --json");
    expect(await copyCommand("x", () => Promise.reject(new Error("no")))).toBe(false);
  });

  it("partial: the map shown plus one line per reason", () => {
    const h = text(view({ status: status("map"), map: { ...fixture, reconciled: false, reconciliation: "change-check not on PATH" } as review.RevMap }));
    expect(h).toContain("Not checked against the card's declared changes: change-check not on PATH.");
    expect(h).toContain("Reviewed 0 of 2 · 1 must-visit left");
  });

  it("the branch moved: the map shown, the line and Make it again", () => {
    const h = view({ status: status("moved"), map: fixture });
    expect(text(h)).toContain("The branch moved since this map (4d2a91b → 9e0f3c1).");
    expect(h).toContain(">Make it again</button>");
    expect(text(h)).toContain("Reviewed 0 of 2");
  });

  it("new map, same symbol: the row reads changed since you reviewed and has no mark", () => {
    const m = { ...marks({}), changed: [{ symbol: "go:example.com/inita/svc.Greet", state: "reviewed" }] } as unknown as review.Marks;
    const h = view({ status: status("map"), map: fixture, marks: m });
    expect(h).toContain('aria-label="Greet, modified, changed since you reviewed"');
    expect(h).toMatch(/<span class="rv-mark " aria-hidden="true"><\/span><span class="rv-name mono">Greet/);
  });

  it("nothing at symbol level: the line and the file list", () => {
    const docs = { ...fixture, nodes: [node({ id: "go:x/doc", level: "package", kind: "package", file: "doc" })], stats: { ...fixture.stats, changed: 0 } } as review.RevMap;
    const h = text(view({ status: status("map"), map: docs }));
    expect(h).toContain("Nothing to review at symbol level: the change touches no Go or TS definition.");
    expect(h).toContain(" doc ");
  });

  it("all reviewed: Reviewed n of n and no Next to review", () => {
    const h = view({ status: status("map"), map: fixture, marks: marks({ "go:example.com/inita/svc.Greet": "reviewed", "ts:web/src/format.ts#formatName": "reviewed" }) });
    expect(text(h)).toContain("Reviewed 2 of 2");
    expect(h).not.toContain("Next to review");
  });

  it("the header: counts, coverage, Next to review with N; ← Card first", () => {
    const h = view({ status: status("map"), map: fixture });
    expect(text(h)).toContain("2bd87db ← da36d87 · 2 symbols changed, 0 tests");
    expect(h).toMatch(/aria-keyshortcuts="N Shift\+N" aria-label="Next to review">Next to review <kbd>N<\/kbd>/);
    expect(h.indexOf("← Card")).toBeLessThan(h.indexOf("Next to review"));
  });

  it("the worklist is one tree, one Tab stop, with the design's names", () => {
    const h = view({ status: status("map"), map: fixture });
    expect(h.match(/tabindex="0"/g)).toHaveLength(1);
    expect(h).toContain('role="tree"');
    expect(h).toContain('aria-label="Must visit, 1 symbol, 0 reviewed"');
    expect(h).toContain('aria-label="format.formatName, modified, no direct test, not in the card&#x27;s declared changes"');
    expect(h).toContain('aria-label="svc, 1 symbol, 0 reviewed"');
  });

  it("a symbol chosen: its title is an h2 that takes focus; none chosen, the place is empty", () => {
    expect(view({ status: status("map"), map: fixture, symbol: "go:example.com/inita/svc.Greet" })).toMatch(/<h2 tabindex="-1" class="review-symbol-title"><span class="mono">Greet<\/span> <span class="rv-change">modified<\/span><\/h2>/);
    expect(view({ status: status("map"), map: fixture })).toContain('<section class="review-symbol empty" aria-label="Symbol"></section>');
  });
});

describe("the crumb (§2)", () => {
  it("reads <initiative> › <card title> › Review, Review current", () => {
    const h = renderToStaticMarkup(<Where screen="initiative" selectedInitiative="init-a" review={{ initiative: "init-a", title: "A card to review" }} go={(f) => f} goHome={noop} openInitiatives={noop} openUsage={noop} />);
    expect(text(h)).toContain("init-a › A card to review › Review");
    expect(h).toContain('<b aria-current="page">Review</b>');
    expect(h.match(/aria-current="page"/g)).toHaveLength(1);
  });
});

describe("FR-22: a row's description is its full path", () => {
  it("each changed row is described by its file", () => {
    const h = view({ status: status("map"), map: fixture });
    expect(h).toContain('aria-describedby="rv-path-ts:web/src/format.ts#formatName"');
    expect(h).toContain('<span id="rv-path-ts:web/src/format.ts#formatName" class="sr-only">web/src/format.ts</span>');
  });
});

describe("V-R5: the row's flags take flagLook", () => {
  it("undeclared is amber, untested muted", () => {
    const h = view({ status: status("map"), map: fixture });
    expect(h).toContain('<span class="rv-flag amber">not in the card&#x27;s declared changes</span>');
    expect(h).toContain('<span class="rv-flag muted">no direct test</span>');
  });
});

describe("P4 (FR-35): the origin row stays current while an affected symbol is shown", () => {
  const G = "go:example.com/inita/svc.Greet", W = "go:example.com/inita/svc.Welcome";
  const m = { ...fixture, nodes: [...fixture.nodes, node({ id: W, parent: "go:example.com/inita/svc", file: "svc/welcome.go", change: "affected" })],
    edges: [{ from: W, to: G, kind: "uses", change: "unchanged", source: "go/types" }] } as unknown as review.RevMap;
  const row = (h: string, id: string) => h.match(new RegExp(`<li[^>]*data-row="${id.replace(/[.#/]/g, "\\$&")}"[^>]*>`))?.[0] ?? "";
  it("Called by → svc.Welcome: Greet's row keeps .on and aria-current; no other row has them", () => {
    const h = view({ status: status("map"), map: m, symbol: W, from: G });
    expect(row(h, G)).toContain('aria-current="true"');
    expect(row(h, G)).toMatch(/class="rv-row on /);
    expect(h.match(/aria-current="true"/g)).toHaveLength(1);
    expect(text(h)).toContain("unchanged · calls svc.Greet");
  });
  it("a changed symbol shown: its own row is current", () => {
    const h = view({ status: status("map"), map: m, symbol: G, from: "" });
    expect(row(h, G)).toContain('aria-current="true"');
  });
});

describe("A4 (FR-29): an asked row is seen, not only heard", () => {
  const G = "go:example.com/inita/svc.Greet", F = "ts:web/src/format.ts#formatName";
  const row = (h: string, id: string) => h.match(new RegExp(`<li[^>]*data-row="${id.replace(/[.#/]/g, "\\$&")}"[^>]*>.*?</li>`))?.[0] ?? "";
  const mk = (m: { symbol: string; state: string; asked?: string }[]) => ({ initiative: "init-a", card: "rv-fixture", head: "", marks: m.map((x) => ({ note: "n", ...x })), changed: [], thread: "01THREAD" }) as unknown as review.Marks;
  it("? asked and ✕ asked as one unit in the mark's place, before the name (leftovers-41 FR-3, R28); a mark not asked draws no word", () => {
    const h = view({ status: status("map"), map: fixture, marks: mk([{ symbol: G, state: "question", asked: "01A" }, { symbol: F, state: "blocked", asked: "01B" }]) });
    expect(row(h, G)).toMatch(/<span class="rv-mark rv-unit question" aria-hidden="true"><span class="rv-glyph">\?<\/span><span class="rv-asked question">asked<\/span><\/span><span class="rv-name mono">/);
    expect(row(h, G)).toContain('aria-label="Greet, modified, question, asked"');
    expect(row(h, F)).toMatch(/<span class="rv-mark rv-unit blocked" aria-hidden="true"><span class="rv-glyph">✕<\/span><span class="rv-asked blocked">asked<\/span><\/span><span class="rv-name mono">/);
    const plain = view({ status: status("map"), map: fixture, marks: mk([{ symbol: G, state: "question" }]) });
    expect(row(plain, G)).not.toContain("rv-asked");
    expect(row(plain, G)).toMatch(/<span class="rv-mark question" aria-hidden="true">\?<\/span><span class="rv-name mono">/);
  });
  it("W3's CSS: the unit sits in the padding where .rv-mark does; an asked row's padding grows by the word, so a wrapped flag starts at the name (FR-36)", () => {
    const css = readFileSync(new URL("../styles/review.css", import.meta.url), "utf8") as string;
    expect(css).toMatch(/\.rv-mark \{ position: absolute; left: var\(--space-5\);/);
    expect(css).toContain(".rv-mark.rv-unit { width: auto; white-space: nowrap; }");
    expect(css).toContain(".rv-unit > .rv-glyph { display: inline-block; width: 1.5ch; text-align: center; }");
    expect(css).toContain(".rv-row.asked { --rv-asked-w: 32px; padding-left: calc(var(--space-5) + 1.5ch + var(--space-1) + var(--rv-asked-w) + var(--space-1-5)); }");
    expect(css).toMatch(/\.rv-asked \{ display: inline-block; width: var\(--rv-asked-w\); margin-left: var\(--space-1\);/);
    const h = view({ status: status("map"), map: fixture, marks: mk([{ symbol: G, state: "question", asked: "01A" }]) });
    expect(row(h, G)).toMatch(/class="rv-row[^"]* asked"/);
    expect(row(h, F)).not.toMatch(/class="rv-row[^"]* asked"/);
  });
  it("the live region carries what the screen says (Asked sup81, once: saidAfter)", () => {
    expect(view({ status: status("map"), map: fixture, said: "Asked sup81" })).toContain('<div class="sr-only" aria-live="polite">Asked sup81</div>');
  });
  it("the panel shown: Asked sup81 · Open the thread", () => {
    const h = view({ status: status("map"), map: fixture, symbol: G, from: "", to: { seat: "sup81", why: "runs this card" }, marks: mk([{ symbol: G, state: "question", asked: "01A" }]) });
    expect(text(h)).toContain("Asked sup81 · Open the thread");
  });
});

describe("A6 (FR-38): the last unmarked symbol, on the screen", () => {
  const G = "go:example.com/inita/svc.Greet", F = "ts:web/src/format.ts#formatName";
  const mk = (m: Record<string, string>) => ({ initiative: "init-a", card: "rv-fixture", head: "", marks: Object.entries(m).map(([symbol, state]) => ({ symbol, state, note: "n" })), changed: [] }) as unknown as review.Marks;
  it("Greet with formatName marked: Reviewed with no next; with both open: Reviewed, next", () => {
    expect(view({ status: status("map"), map: fixture, symbol: G, from: "", marks: mk({ [F]: "question" }) })).toMatch(/<button class="primary">Reviewed<\/button>/);
    expect(view({ status: status("map"), map: fixture, symbol: G, from: "", marks: mk({}) })).toMatch(/<button class="primary">Reviewed, next<\/button>/);
  });
  it("after the press: Reviewed 2 of 2, Next to review gone", () => {
    const h = view({ status: status("map"), map: fixture, symbol: G, from: "", marks: mk({ [F]: "question", [G]: "reviewed" }) });
    expect(text(h)).toContain("Reviewed 2 of 2");
    expect(h).not.toContain("Next to review");
    expect(h).toMatch(/<button class="primary">Reviewed<\/button>/);
  });
});

describe("A8 (FR-40): the screen hands the list to the panel", () => {
  const G = "go:example.com/inita/svc.Greet", W = "go:example.com/inita/svc.Welcome";
  const m = { ...fixture, nodes: [...fixture.nodes, node({ id: W, parent: "go:example.com/inita/svc", file: "svc/welcome.go", change: "affected" })],
    edges: [{ from: W, to: G, kind: "uses", change: "unchanged", source: "go/types" }, { from: G, to: W, kind: "uses", change: "unchanged", source: "go/types" }] } as unknown as review.RevMap;
  it("mutual calls: opened from Called by reads calls; from Calls reads called by", () => {
    expect(text(view({ status: status("map"), map: m, symbol: W, from: G, via: "calledBy" }))).toContain("unchanged · calls svc.Greet");
    expect(text(view({ status: status("map"), map: m, symbol: W, from: G, via: "calls" }))).toContain("unchanged · called by svc.Greet");
  });
});
