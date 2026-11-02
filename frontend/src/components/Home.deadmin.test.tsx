import { describe, expect, it, vi } from "vitest";
import type { merge, service } from "../../wailsjs/go/models";
// @ts-expect-error node:fs has no type declarations in this tsconfig
import { readFileSync } from "node:fs";

// leftovers-57 W13 (Amendment 7, FR-19): Home's run signal reads the
// report's own `progress.dead_minutes` and sums no span. The fixture is the
// contract's sample with `dead_minutes` 90 and its spans changed to sum to
// something else (here 25), so a summing reader says 25 min, not 1 h 30 min.

vi.mock("../stores/board.store", () => {
  const state = {};
  const useBoard = Object.assign((sel?: (s: typeof state) => unknown) => (sel ? sel(state) : state), { getState: () => state });
  return { useBoard };
});
vi.mock("../../wailsjs/go/main/App", () => ({}));
vi.mock("../../wailsjs/runtime/runtime", () => ({ EventsOn: () => () => undefined }));
vi.mock("../hooks/useWails", () => ({ api: {} }));
vi.mock("../lib/drafts", async (orig) => ({ ...(await orig<typeof import("../lib/drafts")>()), useDraft: () => null }));

const { runSignalFor, runSignalWords } = await import("./Home");

const fixture = (f: string) => JSON.parse(readFileSync(new URL(`./runreport.fixtures/${f}`, import.meta.url), "utf8"));
const sample = fixture("expected.json") as service.FactoryReport;
const windowsList = fixture("expected-windows.json").windows as service.ReportWindow[];
const latest = windowsList.find((w) => w.moved)!;
const local = { id: "fixture", local: true, machine: "lodestar", live: 0, working: 0, problems: [], decisions: [] } as unknown as merge.BoardInitiative;

describe("W13: Home's signal reads progress.dead_minutes (FR-19)", () => {
  it("dead_minutes 90 over spans summing to 25 reads 1 h 30 min", () => {
    const p = sample.progress!;
    expect(p.dead_minutes, "the contract sample's window total").toBe(90);
    const spans = (p.dead ?? []).map((d, i) => ({ ...d, minutes: i === 0 ? 25 : 0 }));
    expect(spans.length).toBeGreaterThan(0);
    expect(spans.reduce((a, d) => a + d.minutes, 0)).not.toBe(90);
    const report = { ...sample, progress: { ...p, dead: spans } } as service.FactoryReport;
    const mem = new Map<string, string>();
    vi.stubGlobal("localStorage", { getItem: (k: string) => mem.get(k) ?? null, setItem: (k: string, v: string) => void mem.set(k, v), removeItem: (k: string) => void mem.delete(k), clear: () => mem.clear() });
    const run = runSignalFor(local, { windows: windowsList, report }, latest.until * 1000 + 2 * 3600 * 1000);
    expect(run).toEqual({ live: false, cards: 4, deadMin: 90 });
    expect(runSignalWords(run!)).toBe("last run · 4 cards · 1 h 30 min stopped");
  });
});
