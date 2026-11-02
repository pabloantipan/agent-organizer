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
