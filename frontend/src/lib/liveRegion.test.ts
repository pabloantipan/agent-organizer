import { afterEach, describe, expect, it, vi } from "vitest";
import { speaker } from "./liveRegion";

// leftovers-32 FR-2, row N2 (launch-progress L20): the region empties, then
// reads the message in a following task, so the same message twice is said
// twice.

afterEach(() => { vi.useRealTimers(); });

describe("N2: a repeated message is said again", () => {
  it("empties then reads `a`, twice, with a fake clock", () => {
    vi.useFakeTimers();
    const seen: string[] = [];
    const { say } = speaker((m) => seen.push(m));
    say("a");
    expect(seen).toEqual([""]);
    vi.advanceTimersByTime(0);
    expect(seen).toEqual(["", "a"]);
    say("a");
    expect(seen).toEqual(["", "a", ""]);
    vi.advanceTimersByTime(0);
    expect(seen).toEqual(["", "a", "", "a"]);
  });

  it("uses a task, never a frame", () => {
    vi.useFakeTimers();
    const raf = vi.fn();
    (globalThis as { requestAnimationFrame?: unknown }).requestAnimationFrame = raf;
    const seen: string[] = [];
    speaker((m) => seen.push(m)).say("b");
    vi.runAllTimers();
    expect(seen).toEqual(["", "b"]);
    expect(raf).not.toHaveBeenCalled();
    delete (globalThis as { requestAnimationFrame?: unknown }).requestAnimationFrame;
  });

  it("a newer message before the task replaces the older one; stop drops it", () => {
    vi.useFakeTimers();
    const seen: string[] = [];
    const s = speaker((m) => seen.push(m));
    s.say("a");
    s.say("b");
    vi.advanceTimersByTime(0);
    expect(seen).toEqual(["", "", "b"]);
    s.say("c");
    s.stop();
    vi.runAllTimers();
    expect(seen).toEqual(["", "", "b", ""]);
  });
});
