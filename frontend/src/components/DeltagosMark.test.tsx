import { afterEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { DeltagosLockup, DeltagosMark, markFrame, markLength, PLAY_MS, runMark, stepTravel, type MarkFrame } from "./DeltagosMark";

// window.matchMedia as Reduce motion would answer it (no DOM in these tests).
function reduceMotion(on: boolean) {
  vi.stubGlobal("window", { matchMedia: (q: string) => ({ matches: on && q === "(prefers-reduced-motion: reduce)" }) });
}
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });

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
    const { stop } = runMark((f) => painted.push(f), PLAY_MS, (cb) => queue.push(cb), () => {});
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
    runMark((f) => painted.push(f), PLAY_MS, raf, () => {});
    expect(raf).not.toHaveBeenCalled();
    expect(painted).toEqual([markFrame(0)]);
  });
  it("stops its loop when unmounted", () => {
    reduceMotion(false);
    const caf = vi.fn();
    const { stop } = runMark(() => {}, PLAY_MS, () => 7, caf);
    stop();
    expect(caf).toHaveBeenCalledWith(7);
  });
});

// The browser's frame clock under fake timers: requestAnimationFrame fires
// every 16 ms of fake time with the fake clock's now, so advancing the clock
// is the mark playing. Node has no requestAnimationFrame for vitest to fake,
// so it is the browser's contract over the faked setTimeout.
function frameClock() {
  vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "performance"] });
  vi.stubGlobal("requestAnimationFrame", (cb: (now: number) => void) => setTimeout(() => cb(performance.now()), 16));
  vi.stubGlobal("cancelAnimationFrame", (id: ReturnType<typeof setTimeout>) => clearTimeout(id));
}

describe("the mark rests after 4.5 s (Amendment 7, F25; H1)", () => {
  it("moves 4.5 s after it shows, then stops where it is", () => {
    reduceMotion(false);
    frameClock();
    const painted: MarkFrame[] = [];
    runMark((f) => painted.push(f));
    vi.advanceTimersByTime(1000);
    expect(painted.length).toBeGreaterThan(30);
    vi.advanceTimersByTime(PLAY_MS - 1000 + 100);
    const atRest = painted.length, rest = painted[atRest - 1];
    expect(vi.getTimerCount()).toBe(0); // no frame scheduled
    vi.advanceTimersByTime(10_000);
    expect(painted.length).toBe(atRest); // nothing painted after 4.5 s
    expect(rest.dashoffset).not.toBe(markFrame(0).dashoffset); // a stop, not a jump back
    expect(PLAY_MS).toBeLessThanOrEqual(5000);
  });
  it("moves for 4.5 s of frames, at most 5 s", () => {
    reduceMotion(false);
    frameClock();
    let travel = 0;
    const offsets: number[] = [];
    runMark((f) => offsets.push(-Number(f.dashoffset)));
    vi.advanceTimersByTime(6000);
    // travel is wrapped at the D's length; sum the steps instead
    for (let i = 1; i < offsets.length; i++) travel += (offsets[i] - offsets[i - 1] + markLength) % markLength;
    // 4.5 s at 35% to 165% of 24 units/s
    expect(travel).toBeGreaterThan(4.4 * 24 * 0.35);
    expect(travel).toBeLessThan(5 * 24 * 1.65);
    const frames = offsets.length - 1;
    expect(frames * 16).toBeGreaterThanOrEqual(PLAY_MS);
    expect(frames * 16).toBeLessThan(5000);
  });
  it("plays 4.5 s more when hovered, from where it rested", () => {
    reduceMotion(false);
    frameClock();
    const painted: MarkFrame[] = [];
    const run = runMark((f) => painted.push(f));
    vi.advanceTimersByTime(PLAY_MS + 500);
    const atRest = painted.length, rest = painted[atRest - 1];
    run.play();
    vi.advanceTimersByTime(40);
    expect(painted.length).toBeGreaterThan(atRest);
    expect(Math.abs(Number(painted[atRest].dashoffset) - Number(rest.dashoffset)) % markLength).toBeLessThan(2);
    vi.advanceTimersByTime(PLAY_MS - 40 - 100);
    expect(vi.getTimerCount()).toBe(1); // still moving just before 4.5 s
    vi.advanceTimersByTime(200);
    expect(vi.getTimerCount()).toBe(0); // rests again
    const again = painted.length;
    vi.advanceTimersByTime(10_000);
    expect(painted.length).toBe(again);
  });
  it("a hover while it moves counts 4.5 s from the hover", () => {
    reduceMotion(false);
    frameClock();
    const run = runMark(() => {});
    vi.advanceTimersByTime(4000);
    run.play();
    vi.advanceTimersByTime(PLAY_MS - 100);
    expect(vi.getTimerCount()).toBe(1);
    vi.advanceTimersByTime(200);
    expect(vi.getTimerCount()).toBe(0);
  });
  it("never moves under Reduce motion, hovered or not", () => {
    reduceMotion(true);
    frameClock();
    const painted: MarkFrame[] = [];
    const run = runMark((f) => painted.push(f));
    vi.advanceTimersByTime(1000);
    run.play();
    vi.advanceTimersByTime(PLAY_MS * 2);
    expect(vi.getTimerCount()).toBe(0);
    expect(painted).toEqual([markFrame(0)]);
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
    expect(html).toContain('aria-hidden="true"');
  });
  it("names the lockup once: the mark hidden with no role or label, the wordmark the name (F26; H1)", () => {
    const html = renderToStaticMarkup(<DeltagosLockup />);
    const svg = html.match(/<svg[^>]*>/)![0];
    expect(svg).toContain('aria-hidden="true"');
    expect(svg).toContain('focusable="false"');
    expect(svg).not.toMatch(/\srole=/);
    expect(svg).not.toMatch(/aria-label|aria-labelledby|<title/);
    expect(html).not.toMatch(/<title|<desc/);
    // The accessible text of the lockup, aria-hidden subtrees left out.
    const exposed = html.replace(/<svg[\s\S]*<\/svg>/, "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    expect(exposed).toBe("Deltagos From deltos, the writing tablet, and strategos, the general.");
    expect(exposed.match(/Deltagos/g)).toHaveLength(1);
  });
  it("carries the wordmark and the subtitle in the lockup (H1)", () => {
    const html = renderToStaticMarkup(<DeltagosLockup />);
    expect(html).toContain('<p class="dmark-wordmark">Deltagos</p>');
    expect(html).toContain("From deltos, the writing tablet, and strategos, the general.");
  });
});
