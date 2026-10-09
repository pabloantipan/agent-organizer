import { afterEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { DeltagosLockup, DeltagosMark, markFrame, markLength, runMark, stepTravel, type MarkFrame } from "./DeltagosMark";

// window.matchMedia as Reduce motion would answer it (no DOM in these tests).
function reduceMotion(on: boolean) {
  vi.stubGlobal("window", { matchMedia: (q: string) => ({ matches: on && q === "(prefers-reduced-motion: reduce)" }) });
}
afterEach(() => vi.unstubAllGlobals());

describe("the mark's geometry", () => {
  it("walks the D at the drawing's length", () => {
    expect(markLength).toBeCloseTo(177.05, 2);
  });
  it("draws the still frame the exported app icon draws (travel 0)", () => {
    const f = markFrame(0);
    // docs/ux/inputs/deltagos-mark/app-icon/deltagos-icon-1024.svg
    expect(f.dasharray).toBe("7.75 5.25 7.75 5.25 145.80 5.25");
    expect(f.dashoffset).toBe("0.00");
    expect(f.big).toBe("rotate(0.00 66.8 64.8)");
    expect(f.tips.every((p) => p !== "")).toBe(true);
    expect(f.notches.every((p) => p !== "")).toBe(true);
  });
  it("turns the small gear twice as fast the other way", () => {
    const f = markFrame(25.5); // one radian of the big gear
    expect(f.big).toMatch(/^rotate\(57\.30 /);
    expect(f.small).toMatch(/^rotate\(-114\.59 /);
  });
  it("closes the gaps where the belt is fastest and drops their points", () => {
    const frames = Array.from({ length: 177 }, (_, d) => markFrame(d));
    const closed = frames.filter((f) => f.dasharray.split(" ").some((v, i) => i % 2 === 1 && Number(v) === 0));
    expect(closed.length).toBeGreaterThan(0);
    expect(closed.every((f) => f.tips.includes(""))).toBe(true);
  });
  it("varies the speed: 35% to 165% of 24 units/s, dt capped at 50 ms", () => {
    const speeds = Array.from({ length: 177 }, (_, d) => (stepTravel(d, 0.05) - d) / 0.05);
    expect(Math.min(...speeds)).toBeCloseTo(24 * 0.35, 1);
    expect(Math.max(...speeds)).toBeCloseTo(24 * 1.65, 1);
    expect(stepTravel(0, 1)).toBe(stepTravel(0, 0.05));
  });
});

describe("the mark's motion", () => {
  it("moves when Reduce motion is off", () => {
    reduceMotion(false);
    const painted: MarkFrame[] = [];
    const queue: ((now: number) => void)[] = [];
    const stop = runMark((f) => painted.push(f), (cb) => queue.push(cb), () => {});
    for (let t = 0; t <= 500; t += 16) queue.shift()!(t);
    stop();
    expect(painted[0]).toEqual(markFrame(0));
    expect(painted.length).toBeGreaterThan(20);
    const last = painted[painted.length - 1];
    expect(last.dashoffset).not.toBe("0.00");
    expect(last.big).not.toBe(markFrame(0).big);
  });
  it("shows the still frame and schedules nothing under Reduce motion (F19)", () => {
    reduceMotion(true);
    const painted: MarkFrame[] = [];
    const raf = vi.fn(() => 1);
    runMark((f) => painted.push(f), raf, () => {});
    expect(raf).not.toHaveBeenCalled();
    expect(painted).toEqual([markFrame(0)]);
  });
  it("stops its loop when unmounted", () => {
    reduceMotion(false);
    const caf = vi.fn();
    const stop = runMark(() => {}, () => 7, caf);
    stop();
    expect(caf).toHaveBeenCalledWith(7);
  });
});

describe("the mark rendered", () => {
  it("renders the still frame first, gears clipped to the D, in the app's colours", () => {
    const html = renderToStaticMarkup(<DeltagosMark size={64} />);
    expect(html).toContain('viewBox="20 17 64 66"');
    expect(html).toContain('width="64" height="66"');
    expect(html).toContain('stroke-dasharray="7.75 5.25 7.75 5.25 145.80 5.25"');
    expect(html).toMatch(/class="dmark-big"/);
    expect(html).toMatch(/class="dmark-small"/);
    expect(html).toMatch(/<g mask="url\(#dm[\w-]*s\)">/);
    expect(html).toContain('aria-label="Deltagos mark"');
  });
  it("carries the wordmark and the subtitle in the lockup (H1)", () => {
    const html = renderToStaticMarkup(<DeltagosLockup />);
    expect(html).toContain('<p class="dmark-wordmark">Deltagos</p>');
    expect(html).toContain("From deltos, the writing tablet, and strategos, the general.");
  });
});
