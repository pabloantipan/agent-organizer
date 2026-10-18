import { renderToStaticMarkup } from "react-dom/server";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import type { review } from "../../wailsjs/go/models";

// The symbol's panel (review-map v2 FR-19; docs/ux/specs/review-view.md
// §3.3): V-R4's diff, V-R5's flags, V-R6's affected view, V-R7's claim and
// V-R8's mark, as the pure view renders them to markup (no DOM library is a
// dependency). The harness rows press the keys.

vi.mock("../../wailsjs/go/main/App", () => ({ MarkReview: vi.fn(), ReviewFile: vi.fn() }));

const { ReviewSymbolView } = await import("./ReviewSymbol");
const { worklist } = await import("../lib/review");

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
function panel(p: { id: string; marks?: review.Marks | null; from?: string; texts?: typeof texts | null; claim?: string }) {
  const n = p.claim ? { ...at(p.id), claim: p.claim } as review.Node : at(p.id);
  return renderToStaticMarkup(
    <ReviewSymbolView map={map} node={n} row={rowOf(p.id)} marks={p.marks ?? null} from={p.from ? at(p.from) : null} texts={p.texts === undefined ? texts : p.texts} error={null}
      title={createRef()} onOpen={noop} onBack={noop} onMark={() => Promise.resolve()} onNext={noop} />,
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
    expect(text(h)).toContain("unchanged · shown because it calls svc.Greet");
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
  it("the radio group, Note, Reviewed, next (primary) and Save, then the v3 line", () => {
    const h = text(panel({ id: G }));
    expect(h).toContain("Reviewed Question Blocked Note Reviewed, next Save Kept in Deltagos; asking the supervisor comes later.");
    expect(panel({ id: G })).toMatch(/<button class="primary">Reviewed, next<\/button><button disabled="">Save<\/button>/);
  });
  it("Question with no note keeps Save disabled; with a note it is enabled", () => {
    const q = (note: string) => ({ marks: [{ symbol: G, state: "question", note }], changed: [] }) as unknown as review.Marks;
    expect(panel({ id: G, marks: q("") })).toMatch(/<button disabled="">Save<\/button>/);
    expect(panel({ id: G, marks: q("why the comma?") })).toMatch(/<button>Save<\/button>/);
    expect(panel({ id: G, marks: q("why the comma?") })).toMatch(/checked="" value="question"/);
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
