// leftovers-57 W1, W2, W4, W5 (FR-7, FR-8, FR-10, FR-11, FR-12, FR-13):
// the section drawn from the contract's expected.json (agent-mailbox-specs
// 54cf10d, factory-report 8474386; the committed copy beside this file,
// checked against CONTRACTS_DIR when set). Vitest runs in Node with no DOM:
// the view is a server render with the store and the bindings mocked, and a
// press is the pressed element's own onClick, found in the element tree.
// Times read in UTC, the fixture's zone.
(globalThis as { process?: { env: Record<string, string | undefined> } }).process!.env.TZ = "UTC";

import { isValidElement, type ReactElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { service } from "../../wailsjs/go/models";
import sample from "./runreport.fixtures/expected.json?raw";
import sampleText from "./runreport.fixtures/expected.txt?raw";
import sampleWindows from "./runreport.fixtures/expected-windows.json?raw";

vi.mock("../stores/board.store", () => ({ useBoard: () => ({}) }));
const reportText = vi.fn(async (..._a: string[]) => sampleText);
vi.mock("../../wailsjs/go/main/App", () => ({ ReportText: (...a: string[]) => reportText(...a) }));

const { Progress, Rulings, RunReport, RunReportView, headingOf } = await import("./RunReport");
const { COPIED, argsOf, copyReport, presetsOf } = await import("../lib/runReport");

const env = (globalThis as { process?: { env: Record<string, string | undefined> } }).process!.env;
const fs: { readFileSync(p: string, enc: "utf8"): string } = await import("node:" + "fs");

const report = JSON.parse(sample) as service.FactoryReport;
const data = { report, line_tokens: [{ t: 1792458600, tokens: 52300, sessions: 2 }, { t: 1792468800, tokens: 9100, sessions: 1 }] } as unknown as service.RunReport;
const nav = { card: vi.fn(), decision: vi.fn(), wave: vi.fn() };
const custom = { from: "", to: "", error: "" };
const presets = presetsOf((JSON.parse(sampleWindows) as service.ReportWindows).windows, 1792500000);

type Props = Parameters<typeof RunReportView>[0];
function draw(over: Partial<Props> = {}) {
  const shown = over.shown ?? { kind: "custom", since: report.window!.since, until: report.window!.until, live: false };
  return renderToStaticMarkup(
    <RunReportView heading={headingOf(shown)} presets={presets} pick="custom" custom={custom} shown={shown} data={data} error="" said=""
      narrow={false} folded={false} foldLabel="Last run · 20 Oct" nav={nav} onPick={() => undefined} onCustom={() => undefined}
      onCopy={() => undefined} onUnfold={() => undefined} {...over} />,
  );
}
const names = (html: string, cls: string) =>
  [...html.matchAll(new RegExp(`<li class="rr-row ${cls}[^"]*" aria-label="([^"]*)"`, "g"))].map((m) => m[1]);
const text = (html: string) => html.replace(/<[^>]+>/g, " ").replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();

/** Every element in a tree, functions left uncalled (they may hold hooks). */
function elements(n: ReactNode, out: ReactElement<Record<string, unknown>>[] = []) {
  if (Array.isArray(n)) n.forEach((c) => elements(c, out));
  else if (isValidElement(n)) {
    const e = n as ReactElement<Record<string, unknown>>;
    out.push(e);
    elements(e.props.children as ReactNode, out);
  }
  return out;
}

describe("the committed samples are the contract's", () => {
  it.skipIf(!env.CONTRACTS_DIR)("equal CONTRACTS_DIR/factory-report byte for byte", () => {
    const dir = `${env.CONTRACTS_DIR}/factory-report`;
    expect(sample).toBe(fs.readFileSync(`${dir}/expected.json`, "utf8"));
    expect(sampleText).toBe(fs.readFileSync(`${dir}/expected.txt`, "utf8"));
    expect(sampleWindows).toBe(fs.readFileSync(`${dir}/expected-windows.json`, "utf8"));
  });
});

describe("W1: rows, caption, dead rows, notes (FR-7, FR-12)", () => {
  it("draws the caption, one row per line, the dead rows hatched and neutral, and window start/end for a custom window", () => {
    const html = draw();
    expect(text(html)).toContain("4 cards passed review between 00:00 and 09:00, 20 Oct.");
    expect(names(html, "mode")).toEqual(["00:00, window start", "09:00, window end"]);
    expect(names(html, "line")).toEqual([
      "01:10, 2 cards passed review: a, b, 50 percent, wave sup1/1 and sup2/1",
      "04:00, 1 card passed review: c, 75 percent, wave sup1/1",
      "08:00, 1 card passed review: d, 100 percent, no wave",
    ]);
    expect(names(html, "dead")).toEqual([
      "02:00 to 03:00, usage limit, every seat stopped, 1 hour",
      "05:00 to 05:30, no pulse row: no live seat, machine asleep or Argos down, 30 minutes",
    ]);
    expect(html).not.toContain("stopped now");
    expect(html).not.toMatch(/class="rr-row dead now"/);
    expect(html).toMatch(/<span class="rr-bar hatch" aria-hidden="true"><\/span>/);
    expect(html).toContain('style="width:50%"');
    expect(html).toContain('aria-label="a, commit 60eceeb"');
  });
  it("names an autonomous run's ends by its mode", () => {
    const html = draw({ shown: { kind: "autonomous", since: report.window!.since, until: report.window!.until, live: false } });
    expect(names(html, "mode")).toEqual(["00:00, autonomous mode on", "09:00, autonomous mode off"]);
    expect(html).toContain("While you were away");
  });
  it("live, with the dead span still going: Running now, stopped now in the blocked treatment, now <t> last", () => {
    const until = 1792474200; // 05:30, the second span's end
    const live = { ...data, report: { ...report, window: { ...report.window!, until, kind: "current" } } } as unknown as service.RunReport;
    const html = draw({ data: live, shown: { kind: "current", since: report.window!.since, until, live: true } });
    expect(html).toContain("Running now · since 00:00");
    expect(names(html, "mode")).toEqual(["00:00, autonomous mode on", "05:30, now 05:30"]);
    expect(html).toMatch(/class="rr-row dead now" aria-label="05:00, no pulse row: no live seat, machine asleep or Argos down, stopped now"/);
    expect((html.match(/stopped now/g) ?? []).length).toBe(2); // the name and the word
  });
  it("draws no total of failed rounds: the report carries none (FR-1, AR15)", () => {
    const html = text(draw());
    expect(html).not.toMatch(/review rounds? failed in this window/);
    expect(html).not.toMatch(/\b2 review rounds failed\b/);
  });
  it("draws the notes under the table", () => {
    const withNotes = { ...data, report: { ...report, progress: { ...report.progress!, notes: ["dead time drawn only from 02:00", "second note"] } } } as unknown as service.RunReport;
    const html = draw({ data: withNotes });
    expect(html).toContain('<p class="rr-note">dead time drawn only from 02:00</p><p class="rr-note">second note</p>');
  });
  it("says so when no card passed, and never draws an empty block", () => {
    const none = { ...data, report: { ...report, progress: { ...report.progress!, denominator: { count: 0, kind: "x" }, lines: [], moves: [] } } } as unknown as service.RunReport;
    const html = draw({ data: none });
    expect(html).toContain("No card passed review in this run.");
    expect(names(html, "line")).toEqual([]);
  });
  it("is not drawn on an error, with no chart", () => {
    const html = draw({ error: "factory report not found" });
    expect(html).toContain("Report not drawn: factory report not found");
    expect(html).not.toContain("rr-row");
  });
  it("is folded at the end as Last run · <date> after the recent rule", () => {
    const html = draw({ folded: true });
    expect(text(html)).toContain("Last run · 20 Oct");
    expect(html).not.toContain("rr-row");
  });
  it("reads Run reports are drawn on <machine> for a remote initiative", () => {
    const html = renderToStaticMarkup(<RunReport initiative={{ id: "x", machine: "odyssey", local: false } as never} />);
    expect(text(html)).toContain("Run reports are drawn on odyssey.");
  });
});

describe("W2: the wave column, the disclosure, the footer (FR-8)", () => {
  it("draws the wave column's values", () => {
    const cells = [...draw().matchAll(/<span class="rr-wave mono"[^>]*>([^<]*)<\/span>/g)].map((m) => m[1]);
    expect(cells).toEqual(["·", "sup1/1 sup2/1", "·", "sup1/1", "·", "–", "·"]);
  });
  it("puts each row's cost in its disclosure, closed until pressed, tokens and no money", () => {
    const closed = draw();
    expect(closed).toContain('aria-expanded="false"');
    expect(text(closed)).toContain("7 rounds · 2 failed: execution 1, no cause given 1 · 68 min building · 52.3k tokens");
    expect(text(closed)).toContain("no wave lists these cards · 0 rounds · none failed · 0 min building · no tokens recorded");
    expect(closed).not.toMatch(/\$|USD|dollar/);
    const open = text(draw({ openRows: true }));
    expect(open).toContain("sup1/1 a review fail · a-rev · 00:41–00:45 · execution · A2 unmet");
    expect(open).toContain("sup2/1 b review fail · b-rev · 00:20–00:30 · no cause given · B1 unmet, no cause written");
    expect(open).toContain("No round recorded for these cards in this window.");
  });
  it("lists the footer's waves, and a press opens Work with that wave", () => {
    expect(text(draw())).toContain("Waves in this window");
    const tree = Progress({ report, lineTokens: data.line_tokens, shown: { kind: "custom", since: 0, until: 0, live: false }, nav });
    const lines = elements(tree).filter((e) => e.props.className === "rr-wave-line");
    expect(lines.map((e) => e.props.children)).toEqual([
      "sup2/1 · sup2 · 2 cards (b, e) · 4 rounds, 1 failed (no cause given 1) · 29 min building · not merged",
      "sup1/1 · sup1 · 2 cards (a, c) · 6 rounds, 1 failed (execution 1) · 74 min building",
    ]);
    (lines[1].props.onClick as () => void)();
    expect(nav.wave).toHaveBeenCalledWith(report.waves!.waves[1]);
  });
});

describe("W4: Ruled while you were away (FR-10)", () => {
  const base = report.rulings[0];
  const rulings = [
    { ...base, id: "0003", title: "three", mode: "autonomous" },
    { ...base, id: "0005", title: "five", mode: "away" },
    { ...base, id: "0006", title: "six", mode: undefined },
    { ...base, id: "0007", title: "seven", ruled_by: "", mode: null, note: "ruled_by 'the judge' refused: not a person" },
  ] as unknown as service.Ruling[];
  const html = renderToStaticMarkup(<Rulings rulings={rulings} nav={nav} />);
  const lines = [...html.matchAll(/<li><button[^>]*aria-label="([^"]*)"[^>]*>(.*?)<\/button>(.*?)<\/li>/g)];
  it("draws one decision record line each, with while away for autonomous and away only", () => {
    expect(lines.map((m) => m[2].includes("while away"))).toEqual([true, true, false, false]);
    expect(text(lines[0][2])).toContain("0003 three ruled by pablo 02:30 while away");
  });
  it("shows a refused ruled_by with its note and no ruler", () => {
    expect(lines[3][2]).not.toContain("ruled by");
    expect(text(lines[3][3])).toBe("ruled_by 'the judge' refused: not a person");
    expect(text(lines[3][1])).not.toContain("ruled by");
  });
  it("opens the record when pressed", () => {
    const buttons = elements(Rulings({ rulings, nav })).filter((e) => e.props.className === "rr-ruling");
    (buttons[1].props.onClick as () => void)();
    expect(nav.decision).toHaveBeenCalledWith("0005");
  });
  it("has no subsection for an empty list", () => {
    expect(renderToStaticMarkup(<Rulings rulings={[]} nav={nav} />)).toBe("");
    expect(draw({ data: { ...data, report: { ...report, rulings: [] } } as unknown as service.RunReport })).not.toContain("Ruled while you were away");
  });
});

describe("W5: Copy as text (FR-11)", () => {
  it("writes ReportText's bytes for the window shown, and the polite region says so", async () => {
    const written: string[] = [];
    const said: string[] = [];
    const clipboard = { writeText: vi.fn(async (s: string) => { written.push(s); }) };
    const [s, u] = argsOf(report.window!.since, report.window!.until);
    const { ReportText } = await import("../../wailsjs/go/main/App");
    await copyReport(() => ReportText("fixture", s, u), (t) => clipboard.writeText(t), (m) => said.push(m));
    expect(reportText).toHaveBeenCalledWith("fixture", "@1792454400", "@1792486800");
    expect(written).toEqual([sampleText]);
    expect(said).toEqual([COPIED]);
    expect(COPIED).toBe("Copied the report as text.");
    expect(draw({ said: COPIED })).toContain('<div class="sr-only" role="status" aria-live="polite">Copied the report as text.</div>');
  });
  it("says the clipboard refused when it does, and keeps the button's label", async () => {
    const said: string[] = [];
    await copyReport(async () => sampleText, async () => { throw new Error("denied"); }, (m) => said.push(m));
    expect(said).toEqual(["The clipboard refused the report."]);
    expect(draw()).toContain(">Copy as text</button>");
  });
});
