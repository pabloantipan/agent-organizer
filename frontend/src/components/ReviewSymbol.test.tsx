import { renderToStaticMarkup } from "react-dom/server";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import type { review, service } from "../../wailsjs/go/models";
import type { MarkState } from "../lib/review";
// @ts-expect-error node:fs has no type declarations in this tsconfig
import { readFileSync } from "node:fs";

// The symbol's panel (review-map v2 FR-19; docs/ux/specs/review-view.md
// §3.3): V-R4's diff, V-R5's flags, V-R6's affected view, V-R7's claim and
// V-R8's mark, as the pure view renders them to markup (no DOM library is a
// dependency). The harness rows press the keys.

const openReviewAt = vi.fn((..._: unknown[]) => Promise.resolve());
vi.mock("../../wailsjs/go/main/App", () => ({
  MarkReview: vi.fn(), ReviewFile: vi.fn(), AskReview: vi.fn(), ReviewStatus: vi.fn(), OpenReviewAt: (...a: unknown[]) => openReviewAt(...a),
  // S5 renders the top bar
  FloatAvailable: () => Promise.resolve(false), FloatCompact: () => Promise.resolve(), Help: () => Promise.resolve(null),
}));
// S5 renders the screen Open the thread lands on (top bar, initiative
// header, Conversations) from a plain store; the panel reads none of it.
const board = vi.hoisted(() => ({ state: {} as Record<string, unknown> }));
vi.mock("../stores/board.store", () => ({ useBoard: Object.assign((sel?: (s: unknown) => unknown) => (sel ? sel(board.state) : board.state), { getState: () => board.state, setState: (p: Record<string, unknown>) => Object.assign(board.state, p) }) }));
vi.mock("../../wailsjs/runtime/runtime", () => ({ EventsOn: () => () => undefined }));
vi.mock("../hooks/useWails", () => ({ api: new Proxy({}, { get: () => vi.fn(async () => ({})) }) }));
vi.mock("../lib/drafts", async (orig) => ({ ...(await orig<typeof import("../lib/drafts")>()), useDraft: () => undefined, useDrafts: () => new Set<string>() }));

const { AskStatus, EditorAction, EditorFailed, editorRefused, markPress, openAt, ReviewSymbolView } = await import("./ReviewSymbol");
const { afterSave, canSave, definitionLine, editorAt, focusAfterSave, markControls, markOf, saveShown, threadOf, worklist } = await import("../lib/review");

const node = (n: Partial<review.Node> & { id: string }) => ({
  level: "symbol", parent: "go:example.com/inita/svc", kind: "function", lang: "go", file: "svc/greet.go", change: "modified",
  evidence: { tests: [] }, flags: [], review: { state: "unreviewed" }, ...n,
}) as unknown as review.Node;

const G = "go:example.com/inita/svc.Greet", W = "go:example.com/inita/svc.Welcome", F = "ts:web/src/format.ts#formatName";
const map = {
  version: "0", initiative: "init-a", target: "rv-fixture", base: "da36d87", head: "2bd87db", source: "go/types",
  nodes: [
    node({ id: "go:example.com/inita/svc", level: "package", kind: "package", file: "svc" }),
    node({ id: G, range_head: [3, 6], range_base: [3, 6], evidence: { tests: ["svc/greet_test.go::TestGreet"] } as review.Evidence }),
    node({ id: F, parent: "ts:web/src", lang: "ts", file: "web/src/format.ts", range_head: [1, 4], range_base: [1, 4], flags: ["untested", "undeclared"] }),
    node({ id: W, file: "svc/welcome.go", change: "affected", range_head: [3, 5], range_base: [3, 5] }),
  ],
  edges: [{ from: W, to: G, kind: "uses", change: "unchanged", source: "go/types" }], mismatches: [], reconciled: true,
  stats: { packages: 1, changed: 2, changed_tests: 0, affected: 1, untested: 1, edges: 1 },
} as unknown as review.RevMap;
const at = (id: string) => map.nodes.find((n) => n.id === id)!;
const rowOf = (id: string) => worklist(map).flatMap((g) => g.rows).find((r) => r.id === id) ?? null;
const texts = {
  base: { first: 1, lines: ["package svc", "", "// Greet is what acme's board says first.", "func Greet(name string) string {", '\treturn "hello " + name', "}"] },
  head: { first: 1, lines: ["package svc", "", "// Greet is what acme's board says first.", "func Greet(name string) string {", '\treturn "hello, " + name + "!"', "}"] },
};
const noop = () => undefined;
function panel(p: { id: string; marks?: review.Marks | null; from?: string; texts?: typeof texts | null; claim?: string; to?: { seat: string; why: string } | null; last?: boolean; status?: service.ReviewStatus | null }) {
  const n = p.claim ? { ...at(p.id), claim: p.claim } as review.Node : at(p.id);
  return renderToStaticMarkup(
    <ReviewSymbolView map={map} node={n} row={rowOf(p.id)} marks={p.marks ?? null} from={p.from ? at(p.from) : null} to={p.to} last={p.last} texts={p.texts === undefined ? texts : p.texts} error={null}
      title={createRef()} editor={editorAt(p.status, map.head, n)} onOpenEditor={() => Promise.resolve()} onOpen={noop} onBack={noop} onMark={() => Promise.resolve()} onNext={noop} />,
  );
}
const text = (html: string) => html.replace(/<[^>]+>/g, " ").replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/\s+/g, " ");

describe("V-R4: the title and the scoped diff", () => {
  it("the title: the symbol, its change word, file lines; an h2 that takes focus", () => {
    const h = panel({ id: G });
    expect(h).toMatch(/<h2 tabindex="-1" class="review-symbol-title"><span class="mono">svc.Greet<\/span> <span class="rv-change">modified<\/span><\/h2>/);
    expect(text(h)).toContain("svc/greet.go 3-6");
  });
  it("the diff is a Tab stop named <symbol>, diff, with + and − in the gutter and head line numbers", () => {
    const h = panel({ id: G });
    expect(h).toContain('<div class="rs-diff mono" tabindex="0" role="region" aria-label="svc.Greet, diff">');
    expect(h).toMatch(/<tr class="del"><td class="rs-ln" aria-hidden="true"><\/td><td class="rs-sign">−<\/td><td class="rs-code">\treturn &quot;hello &quot; \+ name<\/td><\/tr>/);
    expect(h).toMatch(/<tr class="add"><td class="rs-ln" aria-hidden="true">5<\/td><td class="rs-sign">\+<\/td>/);
    expect(h.match(/<tr/g)).toHaveLength(7);
    // no syntax colour: the code is plain text in its cell
    expect(h).not.toMatch(/<td class="rs-code"><span/);
  });
});

describe("V-R5: the flags in the design's words", () => {
  it("undeclared is an amber lozenge reading not in the card's declared changes; untested reads no direct test", () => {
    const h = panel({ id: F });
    expect(h).toContain('<span class="rv-flag muted">no direct test</span>');
    expect(h).toContain('<span class="rv-flag amber">not in the card&#x27;s declared changes</span>');
    expect(text(h)).toContain("Tests none name it directly");
  });
});

describe("V-R6: Called by → an affected symbol → ← back", () => {
  it("the changed one links its caller, and Tests names its test", () => {
    const h = panel({ id: G });
    expect(text(h)).toContain("Called by svc.Welcome");
    expect(h).toContain('<button class="link mono">svc.Welcome</button>');
    expect(text(h)).toContain("Tests svc/greet_test.go TestGreet");
  });
  it("the affected one: read-only, its line, no diff, no mark, and back", () => {
    const h = panel({ id: W, from: G });
    expect(text(h)).toContain("unchanged · calls svc.Greet");
    expect(h).toContain(">← back to svc.Greet</button>");
    expect(h).not.toContain("rs-diff");
    expect(h).not.toContain('type="radio"');
    expect(h).not.toContain("Reviewed, next");
  });
});

describe("V-R7: the builder's claim", () => {
  it("under The builder says, in a blockquote, apart from the facts", () => {
    const h = panel({ id: G, claim: "Greet now says hello with a comma." });
    expect(h).toContain('<figure class="rs-claim"><figcaption>The builder says</figcaption><blockquote>Greet now says hello with a comma.</blockquote></figure>');
    expect(h.indexOf("rs-claim")).toBeGreaterThan(h.indexOf("</dl>"));
  });
  it("absent when null", () => {
    expect(panel({ id: G })).not.toContain("The builder says");
  });
});

describe("V-R8: the mark", () => {
  it("the radio group, Note and Reviewed, next (primary); no Save with nothing to save (leftovers-43 FR-4); no line on none (FR-28)", () => {
    const h = text(panel({ id: G }));
    expect(h).toContain("Reviewed Question Blocked Note Reviewed, next");
    expect(h).not.toContain("Save");
    expect(h).not.toContain("Kept in Deltagos");
    expect(panel({ id: G })).not.toContain("rs-ask-line");
    expect(panel({ id: G })).toContain('<div class="rs-buttons"><button class="primary">Reviewed, next</button></div>');
  });
  it("Question with no note keeps Save disabled; with a note it is enabled", () => {
    const q = (note: string) => ({ marks: [{ symbol: G, state: "question", note }], changed: [] }) as unknown as review.Marks;
    // Question chosen on an unmarked symbol differs from the saved none: Save is drawn, disabled until a note
    expect(saveShown("question", "", markOf(null, G))).toBe(true);
    expect(canSave("question", "", markOf(null, G))).toBe(false);
    expect(panel({ id: G, marks: q("why the comma?") })).toMatch(/checked="" value="question"\/><span>Question<\/span>/);
    // a typed note on an unsaved Question enables Save (the harness types it)
    expect(canSave("question", "why the comma?", markOf(null, G))).toBe(true);
    // a saved mark shown unchanged has nothing to save (FR-24): no Save (leftovers-43 FR-4)
    expect(panel({ id: G, marks: q("why the comma?") })).not.toContain(">Save<");
  });
});

describe("V-U1 (FR-24): Save after the last Reviewed, next keeps it", () => {
  it("mark the last unmarked symbol Question, then Reviewed, next, then Save: the mark stays Reviewed", () => {
    // MarkReview as the binding answers it: the marks after the write
    let marks = { marks: [] as { symbol: string; state: string; note: string }[], changed: [] } as unknown as review.Marks;
    const writes: string[] = [];
    const mark = (s: string, note: string) => {
      writes.push(s);
      marks = { ...marks, marks: [...marks.marks.filter((m) => m.symbol !== G), { symbol: G, state: s, note }] } as unknown as review.Marks;
    };
    // the form's sequence (MarkForm): the radios and note, each save resets them from what was saved
    let form: { state: MarkState; note: string } = { state: "question", note: "why the comma?" };
    expect(canSave(form.state, form.note, markOf(marks, G))).toBe(true);
    mark(form.state, form.note);                       // Save
    form = afterSave(form.state, form.note);
    mark("reviewed", form.note);                        // Reviewed, next, nothing left to open
    form = afterSave("reviewed", form.note);
    expect(form).toEqual({ state: "reviewed", note: "why the comma?" });
    // Save now writes nothing: it is disabled until the reader changes the mark
    expect(canSave(form.state, form.note, markOf(marks, G))).toBe(false);
    expect(writes).toEqual(["question", "reviewed"]);
    expect(markOf(marks, G).state).toBe("reviewed");
    // and the panel drawn from those marks reads Reviewed, no Save (leftovers-43 FR-4)
    const h = panel({ id: G, marks });
    expect(h).toMatch(/checked="" value="reviewed"\/><span>Reviewed<\/span>/);
    expect(h).not.toMatch(/checked="" value="question"/);
    expect(h).not.toContain(">Save<");
    // changing the mark again makes Save live
    expect(canSave("question", "still why?", markOf(marks, G))).toBe(true);
  });
});

describe("V-R10: a mark that did not carry", () => {
  it("the panel says changed since you reviewed", () => {
    const m = { marks: [], changed: [{ symbol: F, state: "reviewed" }] } as unknown as review.Marks;
    const h = renderToStaticMarkup(<ReviewSymbolView map={map} node={at(F)} row={worklist(map, m).flatMap((g) => g.rows).find((r) => r.id === F)!} marks={m} from={null} texts={texts} error={null}
      title={createRef()} onOpen={noop} onBack={noop} onMark={() => Promise.resolve()} onNext={noop} />);
    expect(h).toContain('<div class="rv-since">changed since you reviewed</div>');
  });
});

describe("P1 (FR-30, FR-32): which way a neighbour points; an empty list", () => {
  it("opened from Called by: calls; from Calls: called by", () => {
    const L = "go:example.com/inita/svc.lower";
    const m = { ...map, nodes: [...map.nodes, node({ id: L, file: "svc/lower.go", change: "affected" })],
      edges: [...map.edges, { from: G, to: L, kind: "uses", change: "unchanged", source: "go/types" }] } as unknown as review.RevMap;
    const drawn = (id: string) => text(renderToStaticMarkup(<ReviewSymbolView map={m} node={m.nodes.find((n) => n.id === id)!} row={null} marks={null} from={at(G)} texts={null} error={null}
      title={createRef()} onOpen={noop} onBack={noop} onMark={() => Promise.resolve()} onNext={noop} />));
    expect(text(panel({ id: G }))).toContain("Called by svc.Welcome");
    expect(drawn(W)).toContain("unchanged · calls svc.Greet");
    expect(drawn(L)).toContain("unchanged · called by svc.Greet");
  });
  it("Called by and Calls with none read none found", () => {
    const h = text(panel({ id: F }));
    expect(h).toContain("Called by none found Calls none found");
    expect(text(panel({ id: G }))).toContain("Calls none found");
  });
});

describe("P2 (FR-31): the primary saves the chosen mark", () => {
  const saved = (state: string, note: string) => ({ marks: [{ symbol: G, state, note }], changed: [] }) as unknown as review.Marks;
  it("Question with a note: Save question, next; Blocked: Save block, next; Reviewed or none: Reviewed, next", () => {
    expect(panel({ id: G, marks: saved("question", "why the comma?") })).toMatch(/<button class="primary">Save question, next<\/button>/);
    expect(panel({ id: G, marks: saved("blocked", "the comma breaks acme") })).toMatch(/<button class="primary">Save block, next<\/button>/);
    expect(panel({ id: G, marks: saved("reviewed", "") })).toMatch(/<button class="primary">Reviewed, next<\/button>/);
    expect(panel({ id: G })).toMatch(/<button class="primary">Reviewed, next<\/button>/);
  });
  it("Question or Blocked with no note: the primary waits for one", () => {
    expect(panel({ id: G, marks: saved("question", "") })).toMatch(/<button class="primary" disabled="">Save question, next<\/button>/);
    expect(panel({ id: G, marks: saved("blocked", "") })).toMatch(/<button class="primary" disabled="">Save block, next<\/button>/);
  });
});

describe("P3, P4 (FR-33, FR-34, FR-36): the ring, the mono links, the flags' indent", () => {
  const css = (f: string) => readFileSync(new URL(`../styles/${f}`, import.meta.url), "utf8");
  it("the radio ring is drawn on :focus, in the panel and the rule box", () => {
    expect(css("review.css")).toContain(".rs-radio input:focus + span { outline: 2px solid var(--focus-ring); outline-offset: 2px; }");
    expect(css("rule-box.css")).toContain(".rb-option input:focus + span { outline: 2px solid var(--focus-ring); outline-offset: 2px; }");
  });
  it("Called by and Calls links take the mono family over button.link's font: inherit", () => {
    expect(css("review.css")).toContain(".rs-links button.link.mono { font-family: var(--mono);");
  });
  it("the mark sits in the row's padding, so a wrapped flag starts at the name", () => {
    expect(css("review.css")).toMatch(/\.rv-mark \{ position: absolute; left: var\(--space-5\);/);
    expect(css("review.css")).toContain("padding: var(--space-1) var(--space-2) var(--space-1) calc(var(--space-5) + 1.5ch + var(--space-1-5));");
  });
});

describe("A4 (FR-28, FR-29): ask from the mark, mocked bindings", () => {
  const sup = { seat: "sup81", why: "runs this card" };
  const saved = (state: string, note: string, more: Record<string, string> = {}) => ({ marks: [{ symbol: G, state, note, ...more }], changed: [], ...(more.asked ? { thread: "01THREAD" } : {}) }) as unknown as review.Marks;
  it("Question with a note and someone to ask: primary Ask sup81, next; Save only once edited; the line ending Wakes sup81.", () => {
    const h = panel({ id: G, marks: saved("question", "why the comma?"), to: sup });
    expect(h).toContain('<div class="rs-buttons"><button class="primary">Ask sup81, next</button></div>');
    expect(text(h)).toContain("Saves the mark and asks sup81 (runs this card) in this review's thread. Wakes sup81.");
    expect(h).not.toContain("Kept in Deltagos");
  });
  it("Blocked the same; with no note the ask waits for one", () => {
    expect(panel({ id: G, marks: saved("blocked", "x"), to: sup })).toMatch(/<button class="primary">Ask sup81, next<\/button>/);
    expect(panel({ id: G, marks: saved("question", ""), to: sup })).toMatch(/<button class="primary" disabled="">Ask sup81, next<\/button>/);
  });
  it("nobody to ask: Save question, next and No one to ask here: no cell. Kept in Deltagos.", () => {
    const h = panel({ id: G, marks: saved("question", "why the comma?"), to: { seat: "", why: "no cell" } });
    expect(h).toMatch(/<button class="primary">Save question, next<\/button>/);
    expect(text(h)).toContain("No one to ask here: no cell. Kept in Deltagos.");
  });
  it("Reviewed with someone to ask: no line, no ask", () => {
    const h = panel({ id: G, marks: saved("reviewed", ""), to: sup });
    expect(h).toMatch(/<button class="primary">Reviewed, next<\/button>/);
    expect(h).not.toContain("rs-ask-line");
  });
  it("after an ask: Asked sup81 · Open the thread, which opens the review's thread", () => {
    const h = panel({ id: G, marks: saved("question", "why the comma?", { asked: "01MSG" }), to: sup });
    expect(text(h)).toContain("Asked sup81 · Open the thread");
    expect(h).toContain('<a href="#" class="rs-thread">Open the thread</a>');
    const opened: string[] = [];
    const el = AskStatus({ failed: null, asked: true, seat: "sup81", thread: "01THREAD", busy: "", onRetry: noop, onOpenThread: () => opened.push("01THREAD") }) as unknown as { props: { children: { props: { onClick: (e: { preventDefault: () => void }) => void } }[] } };
    const prevent = vi.fn();
    el.props.children[2].props.onClick({ preventDefault: prevent });
    expect(opened).toEqual(["01THREAD"]);
    expect(prevent).toHaveBeenCalled();
    // not asked: no line
    expect(text(panel({ id: G, marks: saved("question", "why the comma?"), to: sup }))).not.toContain("Asked sup81");
  });
  it("a failed ask: the failure words and Try again; while posting, Asking…", () => {
    const f = { seat: "sup81", state: "question" as MarkState, error: "dial unix discuss.sock: connect: no such file or directory" };
    const h = renderToStaticMarkup(<AskStatus failed={f} asked={false} seat="sup81" thread="" busy="" onRetry={noop} onOpenThread={noop} />);
    expect(text(h)).toContain("Saved here; couldn't ask sup81: discuss isn't running. organizer doctor says why. Try again");
    expect(h).toContain(">Try again</button>");
    const busy = renderToStaticMarkup(<AskStatus failed={f} asked={false} seat="sup81" thread="" busy="retry" onRetry={noop} onOpenThread={noop} />);
    expect(busy).toContain('aria-disabled="true"');
    expect(busy).toContain(">Asking…</button>");
  });
  it("the press: an ask posts and moves on; a failed post keeps the mark, says why and stays; Save never asks", async () => {
    const asked = { marks: saved("question", "why?", { asked: "01MSG" }), to: sup, thread: "01THREAD", asked: "01MSG", error: "" } as unknown as service.ReviewAsk;
    const failed = { marks: saved("question", "why?"), to: sup, thread: "", asked: "", error: "dial unix discuss.sock: connect: refused" } as unknown as service.ReviewAsk;
    const onAsk = vi.fn((_s: MarkState, _n: string) => Promise.resolve(asked));
    const onMark = vi.fn((_s: MarkState, _n: string) => Promise.resolve());
    const next = vi.fn();
    expect(await markPress({ ask: true, state: "question", note: " why? ", seat: "sup81", onAsk, onMark, then: next })).toBeNull();
    expect(onAsk).toHaveBeenCalledWith("question", "why?");
    expect(onMark).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledTimes(1);
    const stay = vi.fn();
    const r = await markPress({ ask: true, state: "question", note: "why?", seat: "sup81", onAsk: () => Promise.resolve(failed), onMark, then: stay });
    expect(r).toEqual({ seat: "sup81", state: "question", error: "dial unix discuss.sock: connect: refused" });
    expect(stay).not.toHaveBeenCalled();
    await markPress({ ask: false, state: "question", note: "why?", seat: "sup81", onAsk, onMark, then: noop });
    expect(onMark).toHaveBeenCalledWith("question", "why?");
    expect(onAsk).toHaveBeenCalledTimes(1);
  });
});

describe("A6 (FR-38): the last unmarked symbol", () => {
  const saved = (state: string, note: string) => ({ marks: [{ symbol: G, state, note }], changed: [] }) as unknown as review.Marks;
  it("each mark's primary drops , next", () => {
    expect(panel({ id: G, last: true })).toMatch(/<button class="primary">Reviewed<\/button>/);
    expect(panel({ id: G, marks: saved("question", "q"), last: true })).toMatch(/<button class="primary">Save question<\/button>/);
    expect(panel({ id: G, marks: saved("blocked", "b"), last: true })).toMatch(/<button class="primary">Save block<\/button>/);
    expect(panel({ id: G, marks: saved("question", "q"), last: true, to: { seat: "sup81", why: "runs this card" } })).toMatch(/<button class="primary">Ask sup81<\/button>/);
  });
  it("the press on the last does not move on, so focus stays on the button (the busy rule keeps it while it saves)", async () => {
    // MarkForm passes `then` without onNext when last: only the form's own update runs
    const onNext = vi.fn();
    const shown = vi.fn();
    await markPress({ ask: false, state: "reviewed", note: "", seat: "", onMark: () => Promise.resolve(), then: shown });
    expect(shown).toHaveBeenCalledTimes(1);
    expect(onNext).not.toHaveBeenCalled();
    const src = readFileSync(new URL("./ReviewSymbol.tsx", import.meta.url), "utf8") as string;
    expect(src).toContain('run("next", primary.mark, primary.ask, last ? undefined : onNext)');
  });
});

describe("A7 (FR-39): a muted flag is text", () => {
  const css = readFileSync(new URL("../styles/review.css", import.meta.url), "utf8") as string;
  it("no inline padding on .rv-flag.muted; amber and dashed keep the lozenge's", () => {
    expect(css).toContain(".rv-flag.muted { padding-left: 0; padding-right: 0; }");
    expect(css).toMatch(/\.rv-flag \{[^}]*padding: 1px 7px;/);
    expect(css).not.toMatch(/\.rv-flag\.(amber|dashed) \{[^}]*padding/);
  });
});

describe("A8 (FR-40): the line follows the list it was opened from", () => {
  const mutual = { ...map, edges: [...map.edges, { from: G, to: W, kind: "uses", change: "unchanged", source: "go/types" }] } as unknown as review.RevMap;
  const drawn = (via: "calledBy" | "calls") => text(renderToStaticMarkup(<ReviewSymbolView map={mutual} node={at(W)} row={null} marks={null} from={at(G)} via={via} texts={null} error={null}
    title={createRef()} onOpen={noop} onBack={noop} onMark={() => Promise.resolve()} onNext={noop} />));
  it("two symbols that call each other: calls from Called by, called by from Calls", () => {
    expect(drawn("calledBy")).toContain("unchanged · calls svc.Greet");
    expect(drawn("calls")).toContain("unchanged · called by svc.Greet");
  });
  it("Greet lists Welcome under both, and each link says its list", () => {
    const opened: [string, string | undefined][] = [];
    const props = { map: mutual, node: at(G), row: rowOf(G), marks: null, from: null, texts, error: null,
      title: createRef<HTMLHeadingElement>(), onOpen: (id: string, via?: string) => { opened.push([id, via]); }, onBack: noop, onMark: () => Promise.resolve(), onNext: noop };
    expect(text(renderToStaticMarkup(<ReviewSymbolView {...props} />))).toContain("Called by svc.Welcome Calls svc.Welcome");
    // press each link as drawn, in document order (the panel's own tree)
    type El = { type: unknown; props: { className?: string; onClick?: () => void; children?: unknown } };
    const links: El[] = [];
    const walk = (x: unknown) => {
      if (Array.isArray(x)) return x.forEach(walk);
      if (!x || typeof x !== "object" || !("props" in x)) return;
      const el = x as El;
      if (el.type === "button" && el.props.className === "link mono") links.push(el);
      walk(el.props.children);
    };
    walk(ReviewSymbolView(props));
    for (const l of links) l.props.onClick?.();
    expect(opened).toEqual([[W, "calledBy"], [W, "calls"]]);
  });
});

describe("A9 (FR-29, Amendment 4): a failed ask is seen and said", () => {
  const f = { seat: "fse", state: "question" as MarkState, error: "open /x/tokens.json: no such file or directory" };
  it("the failure line has an id that Try again names", () => {
    const h = renderToStaticMarkup(<AskStatus failed={f} failedId="rs-failed-G" asked={false} seat="fse" thread="" busy="" onRetry={noop} onOpenThread={noop} />);
    expect(h).toContain('<span id="rs-failed-G">Saved here; couldn&#x27;t ask fse: Deltagos has no discuss identity for this cell. organizer doctor says why.</span>');
    expect(h).toMatch(/<button aria-describedby="rs-failed-G"[^>]*>Try again<\/button>/);
  });
  const src = readFileSync(new URL("./ReviewSymbol.tsx", import.meta.url), "utf8") as string;
  it("the primary names the failure line while it shows; the line scrolls into view, nearest, focus untouched", () => {
    expect(src).toContain("const describedBy = failed ? failedId : undefined;");
    expect(src).toContain('<button ref={primaryButton} className="primary" aria-describedby={describedBy}');
    expect(src).toContain('useEffect(() => { line.current?.scrollIntoView?.({ block: "nearest" }); }, [failed]);');
    expect(src.slice(src.indexOf("function FailedLine"))).not.toContain(".focus(");
  });
  it("the review's live region is told the failure (Review's onAsked)", () => {
    const review = readFileSync(new URL("./Review.tsx", import.meta.url), "utf8") as string;
    expect(review).toContain("if (r.error) failed.current = askFailedLine(r.to?.seat || seat, r.error);");
    expect(review).toContain("saidAfter({ asked: asked.current, failed: failed.current,");
  });
});

describe("A11 (FR-42): asked is muted on every row; the glyph keeps its colour", () => {
  const css = readFileSync(new URL("../styles/review.css", import.meta.url), "utf8") as string;
  it(".rv-asked is --fg-muted, with no per-mark or current-row colour", () => {
    expect(css).toMatch(/\.rv-asked \{[^}]*color: var\(--fg-muted\);/);
    expect(css).not.toMatch(/\.rv-asked\.(question|blocked)/);
    expect(css).not.toMatch(/\.on[^{]*\.rv-asked/);
    expect(css).toContain(".rv-mark.blocked { color: var(--danger); }");
    expect(css).toMatch(/\.rv-mark\.question \{ color: var\(--tone\); \}/);
  });
});

describe("W2 (leftovers-41 FR-2, R27): Open the thread is a link", () => {
  const css = readFileSync(new URL("../styles/review.css", import.meta.url), "utf8") as string;
  const h = renderToStaticMarkup(<AskStatus failed={null} asked seat="sup81" thread="01THREAD" busy="" onRetry={noop} onOpenThread={noop} />);
  it("an <a> with an href, so it has role link, is a Tab stop and Enter activates it; no button", () => {
    expect(h).toBe('<p class="rs-asked">Asked sup81 · <a href="#" class="rs-thread">Open the thread</a></p>');
    expect(h).not.toContain("<button");
    expect(h).not.toContain("tabindex");
  });
  it("drawn and ringed as the in-app links (.rd-init): accent text, underline on hover, the ring on :focus-visible only", () => {
    expect(css).toContain(".rs-thread { color: var(--accent-fg); text-decoration: none; }");
    expect(css).toContain(".rs-thread:hover { text-decoration: underline; }");
    expect(css).toContain(".rs-thread:focus { outline: none; }");
    expect(css).toContain(".rs-thread:focus-visible { outline: 2px solid var(--focus-ring); outline-offset: 2px; border-radius: var(--radius-xs); }");
  });
});

describe("W4 (leftovers-41 FR-4, R29): the panel once asked", () => {
  const sup = { seat: "sup81", why: "runs this card" };
  const asked = (state: string, note: string) => ({ marks: [{ symbol: G, state, note, asked: "01MSG" }], changed: [], thread: "01THREAD" }) as unknown as review.Marks;
  it("after an ask: only Asked sup81 · Open the thread; no Saves the mark line, no asking primary", () => {
    const h = panel({ id: G, marks: asked("question", "why the comma?"), to: sup });
    expect(text(h)).toContain("Asked sup81 · Open the thread");
    expect(h).not.toContain("rs-ask-line");
    expect(text(h)).not.toContain("Saves the mark");
    expect(h).not.toContain('class="primary"');
    // the panel ends at the asked line: no Save, no empty button row (leftovers-43 FR-4)
    expect(h).not.toContain("rs-buttons");
    expect(h).toMatch(/<\/textarea><p class="rs-asked">Asked sup81 · <a href="#" class="rs-thread">Open the thread<\/a><\/p><\/div>/);
  });
  it("the same on the last symbol", () => {
    const h = panel({ id: G, marks: asked("blocked", "b"), to: sup, last: true });
    expect(h).not.toContain('class="primary"');
    expect(text(h)).not.toContain("Saves the mark");
  });
  it("the note edited: MarkForm reads markControls with the asked note, so the again line and Ask sup81 again come back", () => {
    const src = readFileSync(new URL("./ReviewSymbol.tsx", import.meta.url), "utf8") as string;
    expect(src).toContain("markControls({ state, note, to, last, asked: !!mark?.asked, askedNote: saved.note })");
    expect(src).toContain("{showPrimary && <button ref={primaryButton} className=\"primary\"");
    expect(src).toContain('{line && <p className="rs-ask-line meta">{line}</p>}');
  });
  it("an ask that stays (the last, Try again) hands focus to Open the thread, which took the button's place", () => {
    const src = readFileSync(new URL("./ReviewSymbol.tsx", import.meta.url), "utf8") as string;
    expect(src).toContain("if (ask && !then) toLink.current = true;");
    expect(src).toContain("link.current.focus();");
  });
});

describe("E3 (leftovers-42 FR-1, FR-3): Open in editor at the head start line", () => {
  const status = (dir: string, head = map.head) =>
    ({ initiative: "init-a", card: "rv-fixture", state: "map", head, map_head: head, checkouts: [{ repo: "", head: "391ae0f0000", dir }] }) as unknown as service.ReviewStatus;
  it("checked out: the title line carries Open in editor, a secondary button, and no not-here line", () => {
    const h = panel({ id: G, status: status("/home/rv/.wt/rv-fixture") });
    expect(h).toContain('<div class="rs-where-line"><span class="meta mono rs-where">svc/greet.go 3-6</span><button type="button" class="rs-editor">Open in editor</button></div>');
    expect(h).not.toContain("Not checked out here");
    // the title stays the symbol and its change word: the button is not in the h2
    expect(h).toMatch(/<h2 tabindex="-1" class="review-symbol-title"><span class="mono">svc.Greet<\/span> <span class="rv-change">modified<\/span><\/h2>/);
  });
  it("the press calls OpenReviewAt with the card, the file and the head start line", async () => {
    const where = editorAt(status("/home/rv/.wt/rv-fixture"), map.head, at(G))!;
    let pressed = 0;
    const el = EditorAction({ at: where, onOpen: () => { pressed++; } }) as unknown as { props: { onClick: () => void } };
    el.props.onClick();
    expect(pressed).toBe(1);
    openReviewAt.mockClear();
    await openAt("init-a", "rv-fixture", where);
    expect(openReviewAt).toHaveBeenCalledWith("init-a", "rv-fixture", "svc/greet.go", 3);
  });
  it("not checked out: no button, and the title line adds, muted, Not checked out here at 391ae0f.", () => {
    const h = panel({ id: G, status: status("") });
    expect(h).not.toContain("Open in editor");
    expect(h).toContain('<span class="meta rs-not-here">Not checked out here at 391ae0f.</span>');
  });
  it("before the status is read, or read for another head, neither is drawn", () => {
    for (const st of [null, status("/x", "0000000ffff")]) {
      const h = panel({ id: G, status: st });
      expect(h).not.toContain("Open in editor");
      expect(h).not.toContain("Not checked out here");
    }
  });
  it("the muted line is --fg-muted, never opacity", () => {
    const css = readFileSync(new URL("../styles/review.css", import.meta.url), "utf8") as string;
    expect(css).toContain(".rs-not-here { color: var(--fg-muted); }");
  });
});

describe("E4 (leftovers-42 FR-4): Open the thread opens the mark's own thread", () => {
  it("a mark asked in a replaced thread opens its asked_thread, not the head's thread", () => {
    const marks = { thread: "01NEW", changed: [], marks: [
      { symbol: G, state: "question", note: "n", asked: "01MSG", asked_thread: "01OLD" },
      { symbol: F, state: "blocked", note: "b", asked: "01MSG2" },
    ] } as unknown as review.Marks;
    expect(threadOf(marks, G)).toBe("01OLD");
    expect(threadOf(marks, F)).toBe("01NEW");
    const src = readFileSync(new URL("./ReviewSymbol.tsx", import.meta.url), "utf8") as string;
    expect(src).toContain("const thread = threadOf(marks, id);");
    expect(src).toContain("onOpenThread={() => onOpenThread?.(thread)}");
  });
});

describe("S1-S4 (leftovers-43): the panel never offers a press that cannot work", () => {
  const src = readFileSync(new URL("./ReviewSymbol.tsx", import.meta.url), "utf8") as string;
  const css = readFileSync(new URL("../styles/review.css", import.meta.url), "utf8") as string;
  const status = (dir: string) => ({ initiative: "init-a", card: "rv-fixture", state: "map", head: map.head, map_head: map.head, checkouts: [{ repo: "", head: "c1765740000", dir }] }) as unknown as service.ReviewStatus;
  const calls = () => {
    const log: string[] = [];
    return { log, o: { sha: "c1765740000", left: () => log.push("left"), focusTitle: () => log.push("focus h2"), say: (m: string) => log.push(`say ${m}`), fail: (l: string) => log.push(`fail ${l}`) } };
  };

  it("S1: refused with … is not checked out here: the head is left, focus on the h2, the line said once, no Error:", () => {
    const { log, o } = calls();
    editorRefused(new Error("c176574 is not checked out here"), o);
    expect(log).toEqual(["left", "focus h2", "say Not checked out here at c176574."]);
    expect(log.join(" ")).not.toContain("Error");
  });
  it("S1: the panel after it: no button, the muted line, one polite region; the container re-reads the status", () => {
    const h = panel({ id: G, status: status("") });
    expect(h).not.toContain("Open in editor");
    expect(h).toContain('<span class="meta rs-not-here">Not checked out here at c176574.</span>');
    expect(h).not.toContain("Error");
    expect(h).not.toContain("review-error");
    expect(h.match(/aria-live="polite"/g)).toHaveLength(1);
    expect(h).toContain('<div class="sr-only" aria-live="polite"></div>');
    // the press's refusal marks the head left at once, then the status read again answers
    expect(src).toContain("const editor = at && left ? { ...at, dir: \"\" } : at;");
    expect(src).toMatch(/const onLeft = \(\) => \{\n\s+setLeft\(true\);\n\s+ReviewStatus\(initiative, card\)/);
    expect(src).toContain("editorRefused(e, { sha: editor.sha, left: () => onLeft?.(), focusTitle: () => title.current?.focus(), say, fail: setFailed });");
    expect(css).toContain(".rs-not-here { color: var(--fg-muted); }");
  });
  it("S2: the editor didn't open: the line under the button, which keeps focus; said; no Error:, not red", () => {
    const { log, o } = calls();
    editorRefused(new Error("editor didn't open: nope"), o);
    expect(log).toEqual(["fail Editor didn't open: nope", "say Editor didn't open: nope"]);
    const where = editorAt(status("/r"), map.head, at(G))!;
    const button = renderToStaticMarkup(<EditorAction at={where} describedBy="rs-editor-failed-x" onOpen={noop} />);
    expect(button).toBe('<button type="button" class="rs-editor" aria-describedby="rs-editor-failed-x">Open in editor</button>');
    expect(renderToStaticMarkup(<EditorFailed id="rs-editor-failed-x" line="Editor didn't open: nope" />)).toBe('<p id="rs-editor-failed-x" class="blocked-reason rs-editor-failed">Editor didn&#x27;t open: nope</p>');
    expect(src).toContain("{failed && editor?.dir && <EditorFailed id={failedId} line={failed} />}");
    expect(css).toMatch(/\.rs-editor-failed \{[^}]*\}/);
    expect(css.match(/\.rs-editor-failed \{[^}]*\}/)![0]).not.toContain("danger");
    // while the service waits on the editor (up to 2 s) the button keeps focus: the busy rule
    expect(renderToStaticMarkup(<EditorAction at={where} busy onOpen={noop} />)).toBe('<button type="button" class="rs-editor" aria-disabled="true">Opening…</button>');
  });
  it("S3: with the head text read, the press opens at the line after the doc comment; the label keeps the range", async () => {
    const h = panel({ id: G, status: status("/r") });
    expect(text(h)).toContain("svc/greet.go 3-6");
    const where = editorAt(status("/r"), map.head, at(G), texts.head)!;
    expect(where.line).toBe(4);
    openReviewAt.mockClear();
    await openAt("init-a", "rv-fixture", where);
    expect(openReviewAt).toHaveBeenCalledWith("init-a", "rv-fixture", "svc/greet.go", 4);
    expect(src).toContain("const at = editorAt(status, head, node, texts?.head);");
  });
  it("S4: an asked unedited symbol has no Save; edited, Save and Ask <seat> again; after Save, focus to the asking primary, else the radio group", () => {
    const sup = { seat: "sup81", why: "runs this card" };
    const asked = { marks: [{ symbol: G, state: "question", note: "why the comma?", asked: "01MSG" }], changed: [], thread: "01THREAD" } as unknown as review.Marks;
    const h = panel({ id: G, marks: asked, to: sup });
    expect(h).not.toContain(">Save<");
    expect(h).not.toContain("rs-buttons");
    // the note edited: the form's state differs from the saved one
    const saved = markOf(asked, G);
    expect(saveShown("question", "why the comma, again?", saved)).toBe(true);
    expect(canSave("question", "why the comma, again?", saved)).toBe(true);
    const edited = markControls({ state: "question", note: "why the comma, again?", to: sup, last: false, asked: true, askedNote: saved.note });
    expect(edited.showPrimary && edited.primary.label).toBe("Ask sup81 again, next");
    // Save pressed: the form shows what was saved, so Save is gone, and focus goes to the asking primary
    const after = afterSave("question", "why the comma, again?");
    expect(saveShown(after.state, after.note, { state: "question", note: "why the comma, again?" })).toBe(false);
    expect(focusAfterSave({ showPrimary: edited.showPrimary, ask: edited.primary.ask })).toBe("primary");
    // no asking primary (Reviewed): the radio group, the checked radio first
    expect(focusAfterSave({ showPrimary: true, ask: false })).toBe("radios");
    expect(src).toContain("{dirty && <button {...busyButton({ busy: busy === \"save\"");
    expect(src).toContain('if (which === "save") afterSaveFocus.current = true;');
    expect(src).toContain('(to ?? radios.current?.querySelector<HTMLInputElement>("input:checked") ?? radios.current?.querySelector<HTMLInputElement>("input"))?.focus();');
    expect(src).not.toMatch(/document\.body\.focus|\.blur\(\)/);
  });
});

describe("S5 (leftovers-43 FR-5, Amendment 1): Conversations after Open the thread", () => {
  it("one aria-current=\"page\" (the crumb), one \"true\" in the chat list (the thread's chat), and the sub-tab's own \"true\"", async () => {
    const { TopBar } = await import("./TopBar");
    const { InitiativeHeader } = await import("./InitiativeHeader");
    const { Conversation } = await import("./Conversation");
    const store = readFileSync(new URL("../stores/board.store.ts", import.meta.url), "utf8") as string;
    // Open the thread is openSlack(initiative, null, thread); it names screen and not review, so leaveReview drops the Review screen
    expect(store).toMatch(/openSlack: \(selectedInitiative, slackFocus, threadId\) => set\(\(st\) => \(\{\n\s+ruleDraft: null, headerOpen: folded\(\), screen: "initiative", sub: "conversations", selectedInitiative, slackFocus, slackDraft: threadId \? \{ threadId \} : null,/);
    expect(store).toContain('const q = "review" in p ? p : { ...p, review: null };');
    const noop = () => undefined;
    const i = { id: "init-a", title: "", description: "", machine: "lodestar", local: true, path: "/r/init-a", status: "active", goal: "g", measure: "", target: "",
      scope: { in: [], out: [] }, stages: [], repos_state: [], problems: [], decisions: [], also_on: [], specs: [] } as unknown;
    Object.assign(board.state, {
      screen: "initiative", sub: "conversations", selectedInitiative: "init-a", review: null, reviewBack: null, slackFocus: null, slackDraft: null,
      view: { board: { initiatives: [i], columns: {}, machines: [{}] }, order: {}, pulled_at: "2026-10-01T00:00:00Z" }, agents: null, headerOpen: false, widthClass: "wide",
      loading: false, syncing: false, error: null, lastMessage: null, account: { signed_in: false, email: "" }, lock: null, authMode: "off", syncNote: null, memoryOpen: false,
      goHome: noop, openSettings: noop, openUsage: noop, openInitiatives: noop, refresh: noop, sync: noop, setAccount: noop, setLock: noop, setOfflineChoice: noop, setMemoryOpen: noop,
      openInitiative: noop, openDecision: noop, openStage: noop, setHeaderOpen: noop, clearSlackDraft: noop, applyAgents: noop, setResolved: noop, openCardLanding: noop,
    });
    // the review's thread, direct with fse: the landing focuses fse's chat (Conversation.test W5)
    const thread = { id: "01THREAD", subject: "rv-fixture: review at 2bd87db", status: "open", kind: "question", posters: ["pablo"], opener: "pablo", to: "fse", age_seconds: 5, messages: 1 };
    const group = { id: "init-a", human: "pablo", project: "organizer-fixture", can_post: false, discuss: "", cell: { agents: ["pablo", "fse", "po_ana"], reconciler: "po_ana" }, threads: [thread], crew: [], waiting: [] } as never;
    const top = renderToStaticMarkup(<TopBar />);
    const head = renderToStaticMarkup(<InitiativeHeader initiative={i as never} />);
    const chats = renderToStaticMarkup(<Conversation group={group} focus="fse" onFocus={noop} />);
    const screen = top + head + chats;
    expect(screen.match(/aria-current="page"/g)).toHaveLength(1);
    expect(top).toContain('<b class="mono crumb-id" title="init-a" aria-current="page">init-a</b>');
    const current = [...chats.matchAll(/<button([^>]*)class="chat[^"]*"[^>]*>[\s\S]*?<span class="chat-name">([^<]*)<\/span>/g)].filter((m) => /aria-current="true"/.test(m[1])).map((m) => m[2]);
    expect(current).toEqual(["fse"]);
    const tabs = head.slice(head.indexOf('<nav class="subtabs"'), head.indexOf("</nav>", head.indexOf('<nav class="subtabs"')));
    expect(tabs.match(/aria-current="true"/g)).toHaveLength(1);
    expect(tabs).toMatch(/<button class="on" aria-current="true">Conversations<\/button>/);
  });
});
