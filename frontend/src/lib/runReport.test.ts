// leftovers-57 W6 (FR-12) and the row model W1 and W2 draw from. Times are
// read in UTC, the contract fixture's zone (make-fixture.sh sets TZ=UTC).
(globalThis as { process?: { env: Record<string, string> } }).process!.env.TZ = "UTC";

import { describe, expect, it } from "vitest";
import type { service } from "../../wailsjs/go/models";
import sample from "../components/runreport.fixtures/expected.json?raw";
import windowsSample from "../components/runreport.fixtures/expected-windows.json?raw";
import {
  RECENT_MAX_MS, RECENT_SEEN_MS, FROM_BEFORE_TO, argsOf, arrivalPreset, captionOf, costWords, customWindow,
  modeWords, presetsOf, rowName, rowsOf, runPlace, spanWords, tracksOf, waveCell, waveFooterWords, windowWords,
  type LineRow,
} from "./runReport";

const report = JSON.parse(sample) as service.FactoryReport;
const windows = (JSON.parse(windowsSample) as service.ReportWindows).windows;
const H = 3600 * 1000;

describe("the recent rule (W6, FR-12, 0167 Q2)", () => {
  const until = Date.UTC(2026, 9, 20, 9);
  it("heads while seen and 23 h past the window's end", () => {
    expect(runPlace({ live: false, until, seenAt: until + H, now: until + 23 * H })).toBe("head");
  });
  it("folds once seen and 25 h past", () => {
    expect(runPlace({ live: false, until, seenAt: until + H, now: until + 25 * H })).toBe("fold");
  });
  it("folds unseen after 8 days (7 days at most)", () => {
    expect(runPlace({ live: false, until, seenAt: null, now: until + 8 * 24 * H })).toBe("fold");
    expect(runPlace({ live: false, until, seenAt: null, now: until + 6 * 24 * H })).toBe("head");
  });
  it("heads while live, whatever its age", () => {
    expect(runPlace({ live: true, until, seenAt: until - 30 * 24 * H, now: until + 30 * 24 * H })).toBe("head");
  });
  it("keeps its spans", () => {
    expect(RECENT_SEEN_MS).toBe(24 * H);
    expect(RECENT_MAX_MS).toBe(7 * 24 * H);
  });
});

describe("the window control (FR-3, A1, A2)", () => {
  const now = 1792500000;
  it("offers moved windows newest first, then Last 24 hours; no Running now without a current window", () => {
    const p = presetsOf(windows, now);
    expect(p.map((x) => x.label)).toEqual(["20 Oct 00:00 – 06:00", "Last 24 hours"]);
    expect(arrivalPreset(p, null)?.key).toBe(`w:${windows[0].since}`);
    expect(argsOf(p[0].since, p[0].until)).toEqual(["@1792454400", "@1792476000"]);
  });
  it("puts Running now first while a window is open, and arrives on it", () => {
    const live = [{ ...windows[0], kind: "current", until: now, moved: true }, ...windows] as service.ReportWindow[];
    const p = presetsOf(live, now);
    expect(p[0]).toMatchObject({ key: "current", label: "Running now", until: now });
    expect(arrivalPreset(p, null)?.key).toBe("current");
  });
  it("arrives on the remembered preset while it is offered", () => {
    const p = presetsOf(windows, now);
    expect(arrivalPreset(p, "last24")?.key).toBe("last24");
    expect(arrivalPreset(p, "w:1")?.key).toBe(`w:${windows[0].since}`);
  });
  it("names a window across midnight by its start's day", () => {
    expect(windowWords(Date.UTC(2026, 9, 26, 23, 40) / 1000, Date.UTC(2026, 9, 27, 7, 10) / 1000)).toBe("26 Oct 23:40 – 07:10");
  });
  it("applies Custom's From and To, and refuses To before From", () => {
    expect(customWindow("2026-10-20T00:00", "2026-10-20T09:00")).toEqual({ since: 1792454400, until: 1792486800 });
    expect(customWindow("2026-10-20T09:00", "2026-10-20T00:00")).toEqual({ error: FROM_BEFORE_TO });
    expect(customWindow("", "2026-10-20T00:00")).toBeNull();
  });
});

describe("the rows over expected.json (FR-7, FR-8)", () => {
  const rows = rowsOf(report, "custom", false, [{ t: 1792458600, tokens: 52300, sessions: 2 }, { t: 1792468800, tokens: 9100, sessions: 1 }]);
  it("draws the mode rows, the three lines and the two dead spans in time order", () => {
    expect(rows.map((r) => r.kind)).toEqual(["mode", "line", "dead", "line", "dead", "line", "mode"]);
    expect(rows[0]).toMatchObject({ words: "window start" });
    expect(rows[6]).toMatchObject({ words: "window end" });
  });
  it("names a run's ends by its mode, and a live one ends on now", () => {
    expect(modeWords("autonomous", false, 1792486800)).toEqual(["autonomous mode on", "autonomous mode off"]);
    expect(modeWords("current", true, 1792486800)).toEqual(["autonomous mode on", "now 09:00"]);
  });
  it("captions the denominator and the window", () => {
    expect(captionOf(report)).toBe("4 cards passed review between 00:00 and 09:00, 20 Oct. Share is of those 4.");
  });
  it("draws the wave column: keys, – for no wave, · for mode and dead rows", () => {
    expect(rows.map(waveCell)).toEqual(["·", "sup1/1 sup2/1", "·", "sup1/1", "·", "–", "·"]);
  });
  it("puts each line's cost in words, tokens matched by t, never money", () => {
    expect(costWords(rows[1] as LineRow)).toBe("7 rounds · 2 failed: execution 1, no cause given 1 · 68 min building · 52.3k tokens");
    expect(costWords(rows[3] as LineRow)).toBe("2 rounds · none failed · 35 min building · 9.1k tokens");
    expect(costWords(rows[5] as LineRow)).toBe("no wave lists these cards · 0 rounds · none failed · 0 min building · no tokens recorded");
  });
  it("names each row in words", () => {
    expect(rowName(rows[1], "01:10")).toBe("01:10, 2 cards passed review: a, b, 50 percent, wave sup1/1 and sup2/1");
    expect(rowName(rows[2], "02:00")).toBe("02:00 to 03:00, usage limit, every seat stopped, 1 hour");
    expect(spanWords(118)).toBe("1 h 58 min");
  });
  it("is stopped now only for a live run's span still going", () => {
    const live = { ...report, window: { ...report.window!, until: 1792474200 } } as unknown as service.FactoryReport;
    const dead = rowsOf(live, "current", true, []).filter((r) => r.kind === "dead");
    expect(dead.map((r) => r.kind === "dead" && r.now)).toEqual([false, true]);
    const after = rowsOf(live, "autonomous", false, []).filter((r) => r.kind === "dead");
    expect(after.map((r) => r.kind === "dead" && r.now)).toEqual([false, false]);
  });
  it("writes the footer lines from waves.waves", () => {
    expect(report.waves!.waves.map(waveFooterWords)).toEqual([
      "sup2/1 · sup2 · 2 cards (b, e) · 4 rounds, 1 failed (no cause given 1) · 29 min building · not merged",
      "sup1/1 · sup1 · 2 cards (a, c) · 6 rounds, 1 failed (execution 1) · 74 min building",
    ]);
  });
});

describe("the tracks over expected.json (FR-9)", () => {
  it("folds a done track with no move and keeps the open ones with their letters", () => {
    const { open, done } = tracksOf(report);
    expect(done.map((x) => [x.letter, x.track.id])).toEqual([["A", "base"]]);
    expect(open.map((x) => [x.letter, x.track.id, x.current])).toEqual([["B", "build", true]]);
  });
  it("draws the no-stage track last", () => {
    const t = report.tracks!.tracks!;
    const r = { ...report, tracks: { ...report.tracks!, tracks: [{ ...t[1], id: "", title: "" }, ...t] } } as unknown as service.FactoryReport;
    expect(tracksOf(r).open.map((x) => x.track.id)).toEqual(["build", ""]);
  });
});
