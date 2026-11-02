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
import runReportSrc from "./RunReport.tsx?raw";

vi.mock("../stores/board.store", () => ({ useBoard: () => ({}) }));
const reportText = vi.fn(async (..._a: string[]) => sampleText);
vi.mock("../../wailsjs/go/main/App", () => ({ ReportText: (...a: string[]) => reportText(...a) }));

const { Progress, Rulings, RunReport, RunReportView, goToWave, headingOf } = await import("./RunReport");
const { COPIED, argsOf, copyReport, presetsOf, waveTarget } = await import("../lib/runReport");

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
/** An element's visible words, its children flattened (the footer draws
 *  the wave in its own span, leftovers-67 FR-8). */
function plain(n: ReactNode): string {
  if (n == null || typeof n === "boolean") return "";
  if (typeof n === "string" || typeof n === "number") return String(n);
  if (Array.isArray(n)) return n.map(plain).join("");
  if (isValidElement(n)) return plain((n.props as { children?: ReactNode }).children);
  return "";
}
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
    expect(lines.map((e) => plain(e.props.children as ReactNode))).toEqual([
      "sup2/1 · sup2 · 2 cards (b, e) · 4 rounds, 1 failed (no cause given 1) · 29 min building · not merged",
      "sup1/1 · sup1 · 2 cards (a, c) · 6 rounds, 1 failed (execution 1) · 74 min building",
    ]);
    (lines[1].props.onClick as () => void)();
    expect(nav.wave.mock.calls[0][0]).toBe(report.waves!.waves[1]);
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

// W9 (leftovers-57 FR-15 to FR-17, PW4 amended, PW7): from the committed
// sample, sup1/1 is finished with a record the scan read, sup2/1 is running,
// and sup0/1 is sup1/1 copied onto a record the scan reported unread.
describe("W9: a wave footer's target and name (FR-15 to FR-17)", () => {
  const root = "/fixture/init";
  const [running, finished] = report.waves!.waves;
  const unread = { ...finished, key: "sup0/1", supervisor: "sup0", record: "runs/2026-10-19-sup0.md" } as service.RunWave;
  const waves = [running, finished, unread];
  const scan = {
    root,
    waves: [{ record: "2026-10-20-sup1.md" }, { record: "2026-10-20-sup1.md" }, { record: "2026-10-19-sup0.md" }],
    problems: [
      { path: `${root}/runs/2026-10-19-sup0.md`, msg: "run record waves: yaml: line 3: did not find expected key", unread: true },
      { path: `${root}/working-on/x.md`, msg: "no frontmatter", unread: true },
    ],
    // Work draws sup2's wave 1 strip (leftovers-64 FR-7).
    strips: [{ n: 1, supervisor: "sup2" }],
  } as Parameters<typeof waveTarget>[1];
  const targetOf = (w: service.RunWave) => waveTarget(w, scan);
  const wNav = { card: vi.fn(), decision: vi.fn(), wave: vi.fn(), waveTarget: targetOf };
  const sampled = { ...report, waves: { ...report.waves!, waves } } as service.FactoryReport;
  const buttons = () => elements(Progress({ report: sampled, lineTokens: data.line_tokens, shown: { kind: "custom", since: 0, until: 0, live: false }, nav: wNav }))
    .filter((e) => e.props.className === "rr-wave-line");

  it("targets the run record, Work and Needs me by the wave's state", () => {
    expect(finished.merged).not.toBeNull();
    expect(running.merged).toBeNull();
    expect(waves.map(targetOf)).toEqual([
      { kind: "work" },
      { kind: "record", path: "runs/2026-10-20-sup1.md" },
      { kind: "unread", path: "runs/2026-10-19-sup0.md" },
    ]);
  });
  it("a finished wave whose record the scan did not read (docs/runs/) and with no strip has no press (leftovers-64 Amendment 1)", () => {
    expect(targetOf({ ...finished, record: "docs/runs/2026-10-15-sup0.md" } as service.RunWave)).toEqual({ kind: "none" });
    expect(targetOf({ ...finished, record: `${root}/runs/2026-10-20-sup1.md` } as service.RunWave)).toEqual({ kind: "record", path: "runs/2026-10-20-sup1.md" });
  });
  it("names and hovers each link by where it goes; the visible text stays the wave's", () => {
    const b = buttons();
    expect(b.map((e) => e.props["aria-label"])).toEqual([
      "show sup2 on Work",
      "open sup1's run record",
      "show sup0's run record in Needs me, Deltagos can't read it",
    ]);
    expect(b.map((e) => e.props.title)).toEqual(b.map((e) => e.props["aria-label"]));
    expect(plain(b[1].props.children as ReactNode)).toBe("sup1/1 · sup1 · 2 cards (a, c) · 6 rounds, 1 failed (execution 1) · 74 min building");
  });
  it("a press opens the record in the reader over the report, Work, or Needs me's unread row", () => {
    const go = { openSpec: vi.fn(async () => undefined), openNeedsMe: vi.fn(), openWave: vi.fn() };
    const el = {} as HTMLElement;
    for (const w of waves) goToWave("init", w, targetOf(w), el, go);
    expect(go.openSpec.mock.calls).toEqual([[el, "init", "runs/2026-10-20-sup1.md", true, "the run report", undefined]]);
    expect(go.openWave.mock.calls).toEqual([["init", 1]]);
    expect(go.openNeedsMe.mock.calls).toEqual([["unread:init"]]);
  });
  it("an initiative with no Needs me rows (paused) opens its unread record in the reader with the scan's reason (Amendment 6)", () => {
    const paused = { ...scan, root: "/fixture/paused", active: false, problems: [
      { path: "/fixture/paused/runs/2026-10-19-sup0.md", msg: "run record waves: yaml: line 3: did not find expected key", unread: true },
      { path: "/fixture/paused/runs/2026-10-19-sup0.md", msg: "second\n  line", unread: true },
    ] } as Parameters<typeof waveTarget>[1];
    const t = waveTarget(unread, paused);
    expect(t).toEqual({ kind: "record", path: "runs/2026-10-19-sup0.md", unread: "run record waves: yaml: line 3: did not find expected key; second line" });
    expect(waveTarget(unread, { ...paused, active: true })).toEqual({ kind: "unread", path: "runs/2026-10-19-sup0.md" });
    expect(waveTarget(finished, { ...paused, waves: [{ record: "2026-10-20-sup1.md" }, { record: "2026-10-19-sup0.md" }] })).toEqual({ kind: "record", path: "runs/2026-10-20-sup1.md" });
    const go = { openSpec: vi.fn(async () => undefined), openNeedsMe: vi.fn(), openWave: vi.fn() };
    const el = {} as HTMLElement;
    goToWave("paused", unread, t, el, go);
    expect(go.openSpec.mock.calls).toEqual([[el, "paused", "runs/2026-10-19-sup0.md", true, "the run report", t.kind === "record" ? t.unread : ""]]);
    expect(go.openNeedsMe).not.toHaveBeenCalled();
    const names = elements(Progress({ report: sampled, lineTokens: null, shown: { kind: "custom", since: 0, until: 0, live: false }, nav: { ...wNav, waveTarget: (w: service.RunWave) => waveTarget(w, paused) } }))
      .filter((e) => e.props.className === "rr-wave-line").map((e) => e.props["aria-label"]);
    expect(names[2]).toBe("open sup0's run record");
  });
  it("the report reads active from Needs me's own rule (inactiveIds)", () => {
    expect(runReportSrc).toContain("const active = !inactiveIds(view).has(id);");
    expect(runReportSrc).toContain('go.openSpec(el, id, t.path, true, "the run report", t.unread)');
  });
  it("names a wave by its key when its supervisor runs two waves in the report", () => {
    const again = { ...running, key: "sup2/2", wave: 2 } as service.RunWave;
    const names = elements(Progress({ report: { ...report, waves: { ...report.waves!, waves: [running, again] } } as service.FactoryReport, lineTokens: null, shown: { kind: "custom", since: 0, until: 0, live: false }, nav: wNav }))
      .filter((e) => e.props.className === "rr-wave-line").map((e) => e.props["aria-label"]);
    expect(names).toEqual(["show sup2/1 on Work", "open sup2/2's run record"]);
  });
});

// leftovers-70 V1 (FR-1; run-report Amendment 6, AR32): `.rt-waitline` is
// `overflow: hidden` (it folds the waits to one line), so a ring drawn
// outside a control in it is cut; the controls inside draw it inset.
describe("leftovers-70 V1 (FR-1, AR32): rings inside the waits line are inset", () => {
  const css = fs.readFileSync(new URL("../styles/runreport.css", import.meta.url).pathname, "utf8");
  it("the waits line clips, and its controls' focus rule draws the ring at outline-offset: -2px", () => {
    expect(css).toMatch(/\.rt-waitline \{[^}]*overflow: hidden;/);
    const rule = /\n(\.rt-waitline [^{]*:focus-visible[^{]*)\{([^}]*)\}/.exec(css);
    expect(rule).not.toBeNull();
    const selectors = rule![1].split(",").map((s) => s.trim());
    expect(selectors).toEqual(expect.arrayContaining([".rt-waitline button:focus-visible", ".rt-waitline a:focus-visible"]));
    expect(rule![2]).toContain("outline-offset: -2px");
  });
});

// leftovers-71 V1 (FR-1; run-report Amendment 7, AR33): the inset ring on a
// card link in the waits line crossed the slug's first glyph, the link having
// no side padding; it pads 4 px each side, keeping its 24 px minimum width.
describe("leftovers-71 V1 (FR-1, AR33): a card link pads its sides so an inset ring clears its glyphs", () => {
  const css = fs.readFileSync(new URL("../styles/runreport.css", import.meta.url).pathname, "utf8");
  it(".rr-card takes padding-inline: var(--space-1) and keeps min-width: 24px", () => {
    const rule = /\n\.rr-card \{([^}]*)\}/.exec(css);
    expect(rule).not.toBeNull();
    const decls = rule![1].split(";").map((d) => d.trim()).filter(Boolean);
    expect(decls).toContain("padding-inline: var(--space-1)");
    expect(decls).toContain("min-width: 24px");
    // Nothing after it in the rule zeroes the sides again.
    const sides = decls.filter((d) => /^padding(-inline|-left|-right)?:/.test(d));
    expect(sides[sides.length - 1]).toBe("padding-inline: var(--space-1)");
  });
});
