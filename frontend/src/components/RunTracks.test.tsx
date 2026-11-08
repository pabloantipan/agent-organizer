// leftovers-57 W3 (FR-9, FR-13, Amendment 2): the tracks of the contract's
// expected.json (committed copy beside this file; see RunReport.test.tsx),
// a two-open-track variant built from it, and a report with drawn: false.
// Times read in UTC, the fixture's zone.
(globalThis as { process?: { env: Record<string, string> } }).process!.env.TZ = "UTC";

import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { service } from "../../wailsjs/go/models";
import sample from "./runreport.fixtures/expected.json?raw";

vi.mock("../stores/board.store", () => ({ useBoard: () => ({}) }));
vi.mock("../../wailsjs/go/main/App", () => ({}));

const { RunTracks } = await import("./RunTracks");
const { NO_TRACKS } = await import("../lib/runReport");

const report = JSON.parse(sample) as service.FactoryReport;
const nav = { card: vi.fn(), decision: vi.fn(), wave: vi.fn() };
const draw = (r: service.FactoryReport, o: { narrow?: boolean; showDone?: boolean } = {}) => renderToStaticMarkup(<RunTracks report={r} nav={nav} {...o} />);
const rowNames = (html: string) => [...html.matchAll(/<li class="rt-row[^"]*" aria-label="([^"]*)"/g)].map((m) => m[1]);
const text = (html: string) => html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

/** expected.json with two more tracks: a second open stage, and the cards
 *  with no stage (id ""), written first to prove it is drawn last. */
function wider(): service.FactoryReport {
  const [base, build] = report.tracks!.tracks!;
  const ship = { ...build, id: "ship", title: "The ship", gates: [], done_cards: [], open_cards: ["g", "h"], to_cut: [], passed: 0, planned: 2, pct: 0, left: ["g", "h"], waits: [{ what: "g", who: "talos", from: "g depends_on" }], env: { local: 0 } };
  const none = { ...build, id: "", title: "", roadmap: false, gates: [], done_cards: [], open_cards: ["z"], to_cut: [], passed: 0, planned: 1, pct: 0, left: ["z"], waits: [], env: { local: 0 } };
  return { ...report, tracks: { ...report.tracks!, tracks: [none, base, build, ship] } } as unknown as service.FactoryReport;
}

describe("W3: tracks (FR-9)", () => {
  it("names the board's moment, folds the done track, and shows local as the only env column", () => {
    const html = draw(report);
    expect(text(html)).toContain("Board as of d277111 · 08:00");
    expect(html).toMatch(/<button type="button" class="rt-fold" aria-expanded="false">1 track done · Show<\/button>/);
    expect(rowNames(html)).toEqual(["B The build, stage 2, now, local 67 percent, 4 of 6 passed, left e, f, waits on 0002 (pablo)"]);
    expect([...html.matchAll(/<div class="rt-head" aria-hidden="true">(.*?)<\/div>/g)][0][1]).toBe("<span>track</span><span>local</span><span>waits on</span>");
    expect(text(html)).toContain("4/6 · left e , f (not cut)");
    expect(text(html)).toContain("Goal, stage build done: 2 cards left (e, f); in its way: 0002 (pablo).");
  });
  it("lists the done tracks with their dates in words when shown", () => {
    expect(text(draw(report, { showDone: true }))).toContain("A The base · done 1 Oct");
  });
  it("draws a chain in one column with ↓, and No stage last", () => {
    const html = draw(wider());
    const names = rowNames(html);
    expect(names.map((n) => n.split(",")[0])).toEqual(["C The build", "D The ship", "A No stage"]);
    expect(names[1]).toContain("after C");
    expect(names[2]).not.toContain("after");
    expect((html.match(/<span class="rt-link" aria-hidden="true">↓<\/span>/g) ?? []).length).toBe(1);
    expect(names[1]).toContain("waits on g (talos)");
  });
  it("moves waits on under its row in a narrow section", () => {
    expect(draw(report, { narrow: true })).toContain('class="rt narrow"');
    expect(draw(report)).not.toContain("narrow");
  });
  it("says there are no tracks to draw when drawn is false or the list is empty", () => {
    const off = { ...report, tracks: { drawn: false, why: "no roadmap" } } as unknown as service.FactoryReport;
    expect(text(draw(off))).toContain(NO_TRACKS);
    expect(NO_TRACKS).toBe("No tracks to draw: no roadmap stages, and no card names a track.");
    const empty = { ...report, tracks: { ...report.tracks!, tracks: [] } } as unknown as service.FactoryReport;
    expect(text(draw(empty))).toContain(NO_TRACKS);
  });
});

// FR-13, AR14: at 1024 the section is narrower than RR_NARROW_BELOW (the
// rail open leaves Overview about 780 px), `waits on` takes its own line
// under the row, and every growing column can shrink to nothing, so no
// part scrolls sideways. The window itself is W7's, in the review build.
describe("the section at 1024 (FR-13)", async () => {
  const fs: { readFileSync(p: URL, enc: "utf8"): string } = await import("node:" + "fs");
  const css = fs.readFileSync(new URL("../styles/runreport.css", import.meta.url), "utf8");
  const { RR_NARROW_BELOW } = await import("./RunReport");
  it("is narrow under 820 px of its own width", () => {
    expect(RR_NARROW_BELOW).toBe(820);
  });
  it("moves waits on under the row, after the fraction line", () => {
    expect(css).toMatch(/\.rt\.narrow \.rt-waits \{ grid-row: 3; grid-column: 1 \/ -1;/);
    expect(css).toMatch(/\.rt-frac \{ grid-row: 2;/);
  });
  it("lets every growing column shrink, and keeps no scroller", () => {
    expect(css).toMatch(/grid-template-columns: 6\.5ch minmax\(4ch, 9ch\) minmax\(64px, 220px\) minmax\(0, 1fr\) 5ch;/);
    expect(css).toMatch(/grid-template-columns: minmax\(0, 1\.2fr\) repeat\(var\(--rt-envs, 1\), 6ch\) minmax\(0, 1fr\);/);
    expect(css).not.toMatch(/overflow(-x)?: (auto|scroll)/);
    expect(css.replace(/\/\*[\s\S]*?\*\//g, "")).not.toMatch(/@layer|color-mix|oklch|@media/);
  });
});

// leftovers-72 V1 (FR-1; run-report Amendment 8, AR35): in a track's `left`
// list the comma sits outside the padded `.rr-card` link, pulled into its
// trailing padding by `margin-inline-start: calc(-1 * var(--space-1))`, so the
// list reads `a, b, c` and a focused ring may touch the comma, never the name.
const fsv: { readFileSync(p: string, enc: "utf8"): string } = await import("node:" + "fs");
describe("leftovers-72 V1 (FR-1, AR35): a left list's commas sit outside the links, pulled in", () => {
  const css = fsv.readFileSync(new URL("../styles/runreport.css", import.meta.url).pathname, "utf8");
  function three(toCut: string[] = []): service.FactoryReport {
    const [, build] = report.tracks!.tracks!;
    const t = { ...build, done_cards: [], open_cards: ["a", "b", "c"], to_cut: toCut, passed: 1, planned: 4, pct: 25, left: ["a", "b", "c"], waits: [] };
    return { ...report, tracks: { ...report.tracks!, tracks: [t] } } as unknown as service.FactoryReport;
  }
  const frac = (html: string) => /<span class="rt-frac">(.*?)<\/span><\/li>/.exec(html)![1];
  it("draws each comma after its link, outside it, and the list reads a, b, c", () => {
    const f = frac(draw(three()));
    const links = [...f.matchAll(/<button type="button" class="rr-card rr-inline">([^<]*)<\/button>/g)].map((m) => m[1]);
    expect(links).toEqual(["a", "b", "c"]);
    expect(f).not.toMatch(/<button[^>]*>[^<]*,[^<]*<\/button>/);
    expect(f.match(/<\/button><span class="rt-comma">,<\/span> /g)).toHaveLength(2);
    expect(f.replace(/<[^>]+>/g, "")).toBe("1/4 · left a, b, c");
  });
  it("keeps the same text with a slug still to cut, whose comma is not pulled", () => {
    const f = frac(draw(three(["b"])));
    expect(f).toContain('<span class="rt-tocut">b (not cut)</span><span class="rt-comma">,</span> ');
    expect(f.replace(/<[^>]+>/g, "")).toBe("1/4 · left a, b (not cut), c");
  });
  it("pulls a comma after a link by the link's side padding, and only there", () => {
    const rule = /\n\.rr-card \+ \.rt-comma \{([^}]*)\}/.exec(css);
    expect(rule).not.toBeNull();
    expect(rule![1].split(";").map((d) => d.trim()).filter(Boolean)).toEqual(["margin-inline-start: calc(-1 * var(--space-1))"]);
    expect(css).not.toMatch(/\n\.rt-comma \{[^}]*margin/);
  });
});

// leftovers-74 V1 (FR-1, AR39; run-report Amendment 10): a link after a comma
// is pulled in by its start padding, as the comma is pulled into the link
// before it, so the gap after a comma is one space before a link and before
// plain text alike. The `.rr-card + .rt-comma` rule stays.
describe("leftovers-74 V1 (FR-1, AR39): one space after every comma, whatever follows", () => {
  const css = fsv.readFileSync(new URL("../styles/runreport.css", import.meta.url).pathname, "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
  const decls = (sel: string) => {
    const esc = sel.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const m = new RegExp(String.raw`(?:^|\n)` + esc + String.raw` \{([^}]*)\}`).exec(css);
    return m ? m[1].split(";").map((d) => d.trim()).filter(Boolean) : null;
  };
  it("pulls a link that follows a comma in by its start padding", () => {
    expect(decls(".rt-comma + .rr-card")).toEqual(["margin-inline-start: calc(-1 * var(--space-1))"]);
  });
  it("keeps the comma pulled into the link before it", () => {
    expect(decls(".rr-card + .rt-comma")).toEqual(["margin-inline-start: calc(-1 * var(--space-1))"]);
  });
  it("matches the left list's markup: a comma, a space, then a link, so the rule reaches it", () => {
    const [, build] = report.tracks!.tracks!;
    const t = { ...build, done_cards: [], open_cards: ["d", "e", "f"], to_cut: ["e"], passed: 1, planned: 4, pct: 25, left: ["d", "e", "f"], waits: [] };
    const html = draw({ ...report, tracks: { ...report.tracks!, tracks: [t] } } as unknown as service.FactoryReport);
    const f = /<span class="rt-frac">(.*?)<\/span><\/li>/.exec(html)![1];
    expect(f).toContain('<span class="rt-tocut">e (not cut)</span><span class="rt-comma">,</span> <button type="button" class="rr-card rr-inline">f</button>');
    expect(f.replace(/<[^>]+>/g, "")).toBe("1/4 · left d, e (not cut), f");
  });
  it("leaves the first item, the plain text and the inset ring as they were", () => {
    expect(css).not.toMatch(/\n\.rt-tocut[^{]*\{[^}]*margin/);
    expect(css).not.toMatch(/\n\.rr-card:first-child/);
    expect(decls(".rr-card.rr-inline:focus-visible")).toEqual(["outline-offset: -2px"]);
  });
});
