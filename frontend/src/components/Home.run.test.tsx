import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { merge, service } from "../../wailsjs/go/models";
// @ts-expect-error node:fs has no type declarations in this tsconfig
import { readFileSync } from "node:fs";

// leftovers-57 W8 (FR-14; run-report §5; 0167 Q3, 0169): Home's initiative
// row with a recent, a live, an old and a remote run. Every report is the
// contract's sample (runreport.fixtures, SOURCE.md); the states the sample
// lacks are built from it here, never from the real home.

const state: Record<string, unknown> = { openInitiative: vi.fn() };
vi.mock("../stores/board.store", () => {
  const useBoard = Object.assign((sel?: (s: typeof state) => unknown) => (sel ? sel(state) : state), { getState: () => state });
  return { useBoard };
});
vi.mock("../../wailsjs/go/main/App", () => ({}));
vi.mock("../../wailsjs/runtime/runtime", () => ({ EventsOn: () => () => undefined }));
vi.mock("../hooks/useWails", () => ({ api: {} }));
vi.mock("../lib/drafts", async (orig) => ({ ...(await orig<typeof import("../lib/drafts")>()), useDraft: () => null }));

const { runSignalFor, runSignalWords, runReadsDue, runKey, signalFacts, Signals } = await import("./Home");

const fixture = (f: string) => JSON.parse(readFileSync(new URL(`./runreport.fixtures/${f}`, import.meta.url), "utf8"));
const report = fixture("expected.json") as service.FactoryReport;
const windowsList = fixture("expected-windows.json").windows as service.ReportWindow[];
// The latest run that moved something: 2026-10-20 00:00 to 06:00 UTC.
const latest = windowsList.find((w) => w.moved)!;
const H = 3600 * 1000;

const local = { id: "fixture", local: true, machine: "lodestar", live: 0, working: 0, problems: [], decisions: [] } as unknown as merge.BoardInitiative;
const remote = { ...local, local: false, machine: "odyssey" } as merge.BoardInitiative;

/** A live run: the sample's windows with a current one on top, its report
 *  the sample's with the window still open. */
const liveWindows = [{ ...latest, kind: "current", since: latest.until + 3600, until: latest.until + 7200, moved: true }, ...windowsList] as service.ReportWindow[];

/** The row's signal cell as Home draws it, to markup. */
function row(i: merge.BoardInitiative, run: ReturnType<typeof runSignalFor>) {
  const sig = signalFacts(i, [i], [], [], null, run);
  return renderToStaticMarkup(<Signals i={i} sig={sig} missing={[]} lead="pablo" onRun={() => undefined} />);
}
const runButton = (html: string) => /<button[^>]*class="lz run"[^>]*>(.*?)<\/button>/.exec(html);
const text = (html: string) => html.replace(/<[^>]+>/g, "");

// The seen times live in browser storage: a fresh in-memory one per test.
const mem = new Map<string, string>();
vi.stubGlobal("localStorage", { getItem: (k: string) => mem.get(k) ?? null, setItem: (k: string, v: string) => void mem.set(k, v), removeItem: (k: string) => void mem.delete(k), clear: () => mem.clear() });
afterEach(() => mem.clear());

describe("W8: Home's row says the last run (FR-14)", () => {
  it("a recent run: last run · 4 cards · 1 h 30 min stopped, no percent", () => {
    const run = runSignalFor(local, { windows: windowsList, report }, latest.until * 1000 + 2 * H);
    expect(run).toEqual({ live: false, cards: 4, deadMin: 90 });
    const html = row(local, run);
    const b = runButton(html);
    expect(b, "the signal is a button in the row").toBeTruthy();
    expect(text(b![1])).toBe("last run · 4 cards · 1 h 30 min stopped");
    expect(html).toContain('data-fold="0"');
    expect(text(html)).not.toContain("%");
  });

  it("a recent run with no dead time: last run · 4 cards", () => {
    const quiet = { ...report, progress: { ...report.progress, dead: [], dead_minutes: 0 } } as unknown as service.FactoryReport;
    const run = runSignalFor(local, { windows: windowsList, report: quiet }, latest.until * 1000 + 2 * H)!;
    expect(runSignalWords(run)).toBe("last run · 4 cards");
  });

  it("a live run: running now · 4 cards so far", () => {
    const run = runSignalFor(local, { windows: liveWindows, report }, (latest.until + 7200) * 1000);
    expect(run?.live).toBe(true);
    expect(text(runButton(row(local, run))![1])).toBe("running now · 4 cards so far");
  });

  it("an old run: none (7 days past its end, seen or not)", () => {
    const run = runSignalFor(local, { windows: windowsList, report }, latest.until * 1000 + 8 * 24 * H);
    expect(run).toBeNull();
    expect(runButton(row(local, run))).toBeNull();
  });

  it("a run seen here and 24 h past its end: none, as Overview folds it", () => {
    expect(runSignalFor(local, { windows: windowsList, report }, latest.until * 1000 + 25 * H), "unseen, it still heads").not.toBeNull();
    localStorage.setItem(`runreport.seen.fixture.${latest.until}`, String(latest.until * 1000 + H));
    expect(runSignalFor(local, { windows: windowsList, report }, latest.until * 1000 + 25 * H)).toBeNull();
  });

  it("a remote initiative: none, and no read is made for it", () => {
    expect(runSignalFor(remote, { windows: windowsList, report }, latest.until * 1000 + 2 * H)).toBeNull();
    expect(runButton(row(remote, null))).toBeNull();
    expect(runReadsDue([{ id: "fixture", local: false, key: "k" }, { id: "other", local: true, key: "k" }], new Map())).toEqual(["other"]);
  });

  it("no run in the 14 days, or a report not drawn: none", () => {
    expect(runSignalFor(local, { windows: [], report: null }, Date.now())).toBeNull();
    expect(runSignalFor(local, { windows: windowsList, report: null }, latest.until * 1000 + 2 * H)).toBeNull();
    expect(runSignalFor(local, undefined, Date.now())).toBeNull();
  });
});

describe("item 4: Home reads each local initiative once, then only when it changes", () => {
  const card = (slug: string, initiative_id: string) => ({ slug, initiative_id, local: true }) as merge.BoardCard;
  const cols = { now: [card("a", "fixture"), card("x", "other")], next: [card("b", "fixture")], done: [] };

  it("reads each local initiative once per load", () => {
    const rows = [{ id: "fixture", local: true, key: runKey("fixture", [local], cols, []) }, { id: "other", local: true, key: "k2" }];
    const done = new Map<string, string>();
    expect(runReadsDue(rows, done)).toEqual(["fixture", "other"]);
    rows.forEach((r) => done.set(r.id, r.key));
    expect(runReadsDue(rows, done)).toEqual([]);
  });

  it("reads again when a card of that initiative moves, not when another's does", () => {
    const before = runKey("fixture", [local], cols, []);
    const passed = { ...cols, now: [card("x", "other")], done: [card("a", "fixture")] };
    expect(runKey("fixture", [local], passed, [])).not.toBe(before);
    const others = { ...cols, now: [card("a", "fixture")], done: [card("x", "other")] };
    expect(runKey("fixture", [local], others, [])).toBe(before);
  });

  it("reads again when seats come or a wave builds", () => {
    const before = runKey("fixture", [local], cols, []);
    expect(runKey("fixture", [{ ...local, live: 2 } as merge.BoardInitiative], cols, [])).not.toBe(before);
    expect(runKey("fixture", [local], cols, [{ n: 3, building: ["a", "b"] } as unknown as service.Wave])).not.toBe(before);
  });
});
