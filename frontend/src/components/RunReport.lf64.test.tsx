// leftovers-64 P1, P2, P4, P6, P7, P8 (FR-1 to FR-8; run-report Amendment 3,
// progress-and-waves Amendment 2; leftovers-64 Amendment 1): the run
// report's polish over the contract's expected.json (the committed copy
// beside RunReport.test.tsx) and the overlay's run record. Server renders
// with the store and bindings mocked, as RunReport.test.tsx does. UTC.
(globalThis as { process?: { env: Record<string, string | undefined> } }).process!.env.TZ = "UTC";

import { isValidElement, type ReactElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { marked } from "marked";
import { describe, expect, it, vi } from "vitest";
import type { service } from "../../wailsjs/go/models";
import type { ScanRuns } from "../lib/runReport";
import sample from "./runreport.fixtures/expected.json?raw";
import runRecord from "../../../testdata/fixture-overlay/init-a/runs/2026-09-24-joins-wave.md?raw";
import tracksSrc from "./RunTracks.tsx?raw";
import readerSrc from "./SpecReader.tsx?raw";
import reportSrc from "./RunReport.tsx?raw";
import stripSrc from "./WaveStrip.tsx?raw";

vi.mock("../stores/board.store", () => ({ useBoard: () => ({}) }));
vi.mock("../hooks/useWails", () => ({ api: {} }));
vi.mock("../../wailsjs/go/main/App", () => ({}));

const { Progress, RunReportView, goToWave, headingOf, stripsOf } = await import("./RunReport");
const { RunTracks } = await import("./RunTracks");
const rr = await import("../lib/runReport");
const sr = await import("../lib/specReader");

const fs: { readFileSync(p: URL, enc: "utf8"): string } = await import("node:" + "fs");
const css = fs.readFileSync(new URL("../styles/runreport.css", import.meta.url), "utf8");

const report = JSON.parse(sample) as service.FactoryReport;
const nav = { card: vi.fn(), decision: vi.fn(), wave: vi.fn() };
const text = (html: string) => html.replace(/<[^>]+>/g, " ").replace(/&#x27;/g, "'").replace(/\s+/g, " ").trim();
/** One CSS rule's body by its exact selector line. */
const rule = (sel: string) => {
  const i = css.indexOf(`\n${sel} {`);
  expect(i, sel).toBeGreaterThanOrEqual(0);
  return css.slice(i, css.indexOf("}", i));
};
function elements(n: ReactNode, out: ReactElement<Record<string, unknown>>[] = []) {
  if (Array.isArray(n)) n.forEach((c) => elements(c, out));
  else if (isValidElement(n)) {
    const e = n as ReactElement<Record<string, unknown>>;
    out.push(e);
    elements(e.props.children as ReactNode, out);
  }
  return out;
}

/** expected.json with the open track waiting on two records. */
function twoWaits(): service.FactoryReport {
  const t = report.tracks!.tracks!;
  const build = { ...t[1], waits: [{ what: "0002", who: "pablo", from: "stage gate" }, { what: "0003", who: "pablo", from: "stage gate" }] };
  return { ...report, tracks: { ...report.tracks!, tracks: [t[0], build] } } as unknown as service.FactoryReport;
}

describe("P1 (FR-1, AR22): several waits in one cell", () => {
  it("read `0002 (pablo) · 0003 (pablo)`, `·` between waits only", () => {
    const html = renderToStaticMarkup(<RunTracks report={twoWaits()} nav={nav} />);
    const line = /<span class="rt-waitline">([\s\S]*?)<span class="rt-measure"/.exec(html)![1];
    expect(text(line)).toBe("0002 (pablo) · 0003 (pablo)");
    expect(rr.waitsWords(twoWaits().tracks!.tracks![1].waits)).toBe("0002 (pablo) · 0003 (pablo)");
  });
  it("past the cell's width shows the waits that fit and `+N`", () => {
    // widths 80 and 80, separator 12, `+1` 16: both need 172.
    expect(rr.waitsThatFit([80, 80], 12, 16, 200)).toBe(2);
    expect(rr.waitsThatFit([80, 80], 12, 16, 171)).toBe(1);
    expect(rr.waitsThatFit([80, 80, 80], 12, 16, 200)).toBe(2); // two and `· +1`: 80+12+80+12+16 = 200
    expect(rr.waitsThatFit([80, 80, 80], 12, 16, 199)).toBe(1);
    expect(rr.waitsThatFit([80, 80, 80], 12, 16, 400)).toBe(3);
    expect(rr.waitsThatFit([300], 12, 16, 100)).toBe(1);
    expect(rr.waitsThatFit([], 12, 16, 100)).toBe(0);
  });
  it("the rest are in the `+N`'s hover and name, and every wait in the row's name", () => {
    const ws = twoWaits().tracks!.tracks![1].waits;
    expect(rr.moreWaits(ws, 1)).toEqual({ text: "+1", name: "and 0003 (pablo)" });
    expect(rr.moreWaits(ws, 2)).toBeNull();
    const html = renderToStaticMarkup(<RunTracks report={twoWaits()} nav={nav} />);
    expect(html).toContain("waits on 0002 (pablo), 0003 (pablo)");
    expect(tracksSrc).toContain('title={more.name} aria-label={more.name}');
  });
});

describe("P2 (FR-2, AR23): the not-drawn state", () => {
  it("is muted words with no rule and no red", () => {
    const shown = { kind: "custom" as const, since: 0, until: 0, live: false };
    const html = renderToStaticMarkup(
      <RunReportView heading={headingOf(shown)} presets={[]} pick="custom" custom={{ from: "", to: "", error: "" }} shown={shown} data={null}
        error="factory report not found" said="" narrow={false} folded={false} foldLabel="" nav={nav} onPick={() => undefined}
        onCustom={() => undefined} onCopy={() => undefined} onUnfold={() => undefined} />,
    );
    expect(html).toContain('<p class="rr-not-drawn">Report not drawn: factory report not found</p>');
    const body = rule(".rr-not-drawn");
    expect(body).toContain("color: var(--fg-muted)");
    expect(body).not.toMatch(/border|status-blocked|padding/);
    expect(rule(".rr-none, .rr-note, .rr-not-drawn")).toContain("font-size: var(--font-size-sm)");
  });
});

describe("P4 (FR-4, AR25): a line the ledger has no run for", () => {
  it("reads `no tokens recorded`, never 0", () => {
    const rows = rr.rowsOf(report, "custom", false, [{ t: 1792458600, tokens: 0, sessions: 0 }, { t: 1792468800, tokens: 9100, sessions: 1 }] as service.LineTokens[]);
    const lines = rows.filter((r): r is import("../lib/runReport").LineRow => r.kind === "line");
    expect(rr.costWords(lines[0])).toBe("7 rounds · 2 failed: execution 1, no cause given 1 · 68 min building · no tokens recorded");
    expect(rr.costWords(lines[1])).toBe("2 rounds · none failed · 35 min building · 9.1k tokens");
    const html = renderToStaticMarkup(<Progress report={report} lineTokens={[{ t: 1792458600, tokens: 0, sessions: 0 }] as service.LineTokens[]} shown={{ kind: "custom", since: 0, until: 0, live: false }} nav={nav} />);
    expect(html).not.toContain("0 tokens");
    expect(html.match(/no tokens recorded/g)?.length).toBe(3);
  });
});

describe("P5's half in markup (FR-5, AR26): a window over days widens the time column", () => {
  it("marks the chart `days` and sizes the column for `Ddd HH:MM`", () => {
    const over = { ...report, window: { ...report.window!, since: report.window!.since - 3600 * 2 } } as service.FactoryReport;
    const html = renderToStaticMarkup(<Progress report={over} lineTokens={null} shown={{ kind: "custom", since: 0, until: 0, live: false }} nav={nav} />);
    expect(html).toContain('<div class="rr-progress days">');
    expect(text(html)).toMatch(/Tue \d\d:\d\d/);
    expect(rule(".rr-progress.days .rr-head, .rr-progress.days .rr-row")).toContain("grid-template-columns: 10ch ");
  });
});

describe("P6 (FR-6): the chain connector", () => {
  it("is --fg-subtle and not in the accessible name", () => {
    const t = report.tracks!.tracks!;
    const chained = { ...report, tracks: { ...report.tracks!, tracks: [t[1], { ...t[1], id: "ship", title: "The ship" }] } } as unknown as service.FactoryReport;
    const html = renderToStaticMarkup(<RunTracks report={chained} nav={nav} />);
    expect(html).toContain('<span class="rt-link" aria-hidden="true">↓</span>');
    expect([...html.matchAll(/aria-label="([^"]*)"/g)].map((m) => m[1]).join(" ")).not.toContain("↓");
    expect(rule(".rt-link")).toContain("color: var(--fg-subtle)");
    expect(rule(".rt-link")).not.toContain("--border-strong");
  });
});

describe("P3's half in CSS (FR-3, AR24): 24 px targets by padding", () => {
  it("pads .rr-card, .rr-more and .rt-fold to 4 + 16 + 4", () => {
    expect(rule(".rr-card")).toMatch(/padding: var\(--space-1\) 0; line-height: var\(--line-sm\)/);
    expect(rule(".rr-more")).toContain("padding: var(--space-1);");
    expect(rule(".rr-more")).toContain("line-height: var(--line-sm)");
    expect(rule(".rt-fold")).toContain("padding: var(--space-1) var(--space-2)");
    expect(rule(".rt-fold")).toContain("line-height: var(--line-sm)");
  });
});

describe("P7 (FR-7, PW4 amended again, Amendment 1): a wave footer opens Work only when Work draws its strip", () => {
  const root = "/fixture/init";
  const [sup2, sup1] = report.waves!.waves;
  const scan = { root, waves: [{ record: "2026-10-20-sup1.md" }], problems: [] } as ScanRuns;
  const strip = { n: 1, label: "wave 1", building: [{ slug: "b" }], in_review: [], queued: [], done: [], supervisor: "sup2" } as unknown as service.Wave;
  const stopped = { ...strip, building: [], done: [{ slug: "b" }] } as unknown as service.Wave;

  it("uses Work's own predicate, `running` from WaveStrip.tsx", () => {
    expect(stripSrc).toContain("export const running = (w: service.Wave) =>");
    expect(reportSrc).toContain('import { running } from "./WaveStrip";');
    expect(reportSrc).toContain(".filter(running)");
    expect(stripsOf([strip, stopped])).toEqual([{ n: 1, supervisor: "sup2" }]);
  });
  it("record for the fixture's sup2/1 (not merged, no strip), record for a merged wave, Work for a wave with a strip", () => {
    expect(sup2.merged).toBeNull();
    expect(sup1.merged).not.toBeNull();
    expect(rr.waveTarget(sup2, scan)).toEqual({ kind: "record", path: "runs/2026-10-20-sup1.md" });
    expect(rr.waveTarget(sup1, scan)).toEqual({ kind: "record", path: "runs/2026-10-20-sup1.md" });
    expect(rr.waveTarget(sup2, { ...scan, strips: stripsOf([strip]) })).toEqual({ kind: "work" });
    // A strip of another supervisor's wave 1 is not sup1/1's.
    expect(rr.waveTarget(sup1, { ...scan, strips: stripsOf([strip]) })).toEqual({ kind: "record", path: "runs/2026-10-20-sup1.md" });
    // A stopped strip is not drawn, so the record.
    expect(rr.waveTarget(sup2, { ...scan, strips: stripsOf([stopped]) })).toEqual({ kind: "record", path: "runs/2026-10-20-sup1.md" });
  });
  it("names the press `open sup2's run record`", () => {
    const b = elements(Progress({ report, lineTokens: null, shown: { kind: "custom", since: 0, until: 0, live: false }, nav: { ...nav, waveTarget: (w) => rr.waveTarget(w, scan) } }))
      .filter((e) => e.props.className === "rr-wave-line");
    expect(b.map((e) => [e.type, e.props["aria-label"]])).toEqual([["button", "open sup2's run record"], ["button", "open sup1's run record"]]);
  });
  it("a wave not merged, with no strip and no record the scan read is text with no press, named `sup2/1: no run record`", () => {
    const none = { ...scan, waves: [] };
    expect(rr.waveTarget(sup2, none)).toEqual({ kind: "none" });
    const els = elements(Progress({ report, lineTokens: null, shown: { kind: "custom", since: 0, until: 0, live: false }, nav: { ...nav, waveTarget: (w) => rr.waveTarget(w, none) } }))
      .filter((e) => typeof e.props.className === "string" && (e.props.className as string).startsWith("rr-wave-line"));
    expect(els[0].type).toBe("span");
    expect(els[0].props.onClick).toBeUndefined();
    expect(els[0].props["aria-label"]).toBe("sup2/1: no run record");
    const go = { openSpec: vi.fn(async () => undefined), openNeedsMe: vi.fn(), openWave: vi.fn() };
    goToWave("init", sup2, { kind: "none" }, null, go);
    expect([go.openSpec, go.openNeedsMe, go.openWave].every((f) => f.mock.calls.length === 0)).toBe(true);
  });
});

describe("P8 (FR-8, PW8): the reader opens a run record at its prose", () => {
  const read = () => {
    const src = sr.readerSource("runs/2026-09-24-joins-wave.md", runRecord);
    return { src, html: sr.withAnchors(marked.parse(src.md) as string + src.after).html };
  };
  it("opens at the first prose heading", () => {
    const { src, html } = read();
    expect(src.runRecord).toBe(true);
    expect(sr.firstHeadingId(html)).toBe("the-joins-first-wave-fixture");
    expect(html.indexOf("<h1")).toBeLessThan(html.indexOf("<details"));
    expect(readerSrc).toContain("runRecord ? firstHeadingId(html) : null");
  });
  it("folds the waves: block after the prose under a closed `Rounds as recorded`, opening to the yaml in mono", () => {
    const { html } = read();
    expect(html).toMatch(/<details class="sr-rounds"><summary>Rounds as recorded<\/summary><pre><code class="language-yaml">waves:\n {2}- wave: 1\n/);
    expect(html).not.toMatch(/<details[^>]* open/);
    expect(html.slice(0, html.indexOf("<details"))).not.toContain("waves:");
  });
  it("leaves other files as they were: frontmatter as a yaml block first", () => {
    const spec = "---\nstatus: proposed\n---\n\n# A spec\n";
    expect(sr.readerSource("docs/specs/x.md", spec)).toEqual({ md: sr.frontmatterAsCode(spec), after: "", runRecord: false });
    expect(sr.readerSource("docs/runs/x.md", runRecord).runRecord).toBe(false);
    expect(sr.readerSource("runs/2026-09-20-prose-only.md", "# Prose only\n").runRecord).toBe(false);
  });
});
