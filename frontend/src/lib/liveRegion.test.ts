import { afterEach, describe, expect, it, vi } from "vitest";
import { SAY_GAP_MS, speaker } from "./liveRegion";

// leftovers-32 FR-2, row N2 (launch-progress L20): the region empties, then
// reads the message in a following task, so the same message twice is said
// twice; leftovers-33 FR-4, row P4 (L25): that task runs 100 ms later.

afterEach(() => { vi.useRealTimers(); });

describe("N2: a repeated message is said again", () => {
  it("empties then reads `a`, twice, with a fake clock", () => {
    vi.useFakeTimers();
    const seen: string[] = [];
    const { say } = speaker((m) => seen.push(m));
    say("a");
    expect(seen).toEqual([""]);
    vi.advanceTimersByTime(SAY_GAP_MS);
    expect(seen).toEqual(["", "a"]);
    say("a");
    expect(seen).toEqual(["", "a", ""]);
    vi.advanceTimersByTime(SAY_GAP_MS);
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
    vi.advanceTimersByTime(SAY_GAP_MS);
    expect(seen).toEqual(["", "", "b"]);
    s.say("c");
    s.stop();
    vi.runAllTimers();
    expect(seen).toEqual(["", "", "b", ""]);
  });
});

describe("P4: a repeat waits 100 ms (leftovers-33 FR-4, L25)", () => {
  it("say a, say a again: empty at 0 and 50 ms, a at 100 ms; no requestAnimationFrame", () => {
    vi.useFakeTimers();
    const raf = vi.fn();
    (globalThis as { requestAnimationFrame?: unknown }).requestAnimationFrame = raf;
    let text = "";
    const { say } = speaker((m) => { text = m; });
    say("a");
    vi.advanceTimersByTime(100);
    expect(text).toBe("a");
    say("a");
    expect(text).toBe("");
    vi.advanceTimersByTime(50);
    expect(text).toBe("");
    vi.advanceTimersByTime(49);
    expect(text).toBe("");
    vi.advanceTimersByTime(1);
    expect(text).toBe("a");
    expect(SAY_GAP_MS).toBe(100);
    expect(raf).not.toHaveBeenCalled();
    delete (globalThis as { requestAnimationFrame?: unknown }).requestAnimationFrame;
  });

  it("then runs once the text is set, a replaced message's with the newer text; stop drops it", () => {
    vi.useFakeTimers();
    let text = "";
    const seen: string[] = [];
    const s = speaker((m) => { text = m; });
    s.say("a", () => seen.push(`then a: ${text}`));
    s.say("b", () => seen.push(`then b: ${text}`));
    vi.advanceTimersByTime(99);
    expect(seen).toEqual([]);
    vi.advanceTimersByTime(1);
    expect(seen).toEqual(["then a: b", "then b: b"]);
    s.say("c", () => seen.push("then c"));
    s.stop();
    vi.runAllTimers();
    expect(seen).toEqual(["then a: b", "then b: b"]);
  });
});

// leftovers-80 FR-1, row V1 (run-report A14, AR49): closing the rail's rename
// field hushes the announcer: the region is empty after close, and a sentence
// still waiting its 100 ms is never set afterwards. The rail calls `hush`
// whenever the field closes (Escape, a saved name, focus leaving with a name
// it keeps); `useLiveRegion` hands out this speaker's `hush`.
describe("leftovers-80 V1 (FR-1, AR49): closing the field empties the announcer", () => {
  const line = "A group is already called No client. Type another name, or press Escape to keep misc.";
  const region = () => {
    let text = "";
    const s = speaker((m) => { text = m; });
    return { s, text: () => text };
  };

  it("empties the region after a refusal was said, then close", () => {
    vi.useFakeTimers();
    const r = region();
    r.s.say(line);
    vi.advanceTimersByTime(SAY_GAP_MS);
    expect(r.text()).toBe(line);
    r.s.hush();
    expect(r.text()).toBe("");
    vi.runAllTimers();
    expect(r.text()).toBe("");
  });

  it("a refusal still 100 ms from being set is never set after close", () => {
    vi.useFakeTimers();
    const r = region();
    r.s.say(line);
    vi.advanceTimersByTime(SAY_GAP_MS - 1);
    r.s.hush();
    vi.advanceTimersByTime(SAY_GAP_MS * 5);
    expect(r.text()).toBe("");
  });

  it("drops the waiting `then` too, and the next refusal is said again", () => {
    vi.useFakeTimers();
    const r = region();
    const then = vi.fn();
    r.s.say(line, then);
    r.s.hush();
    vi.runAllTimers();
    expect(then).not.toHaveBeenCalled();
    r.s.say(line);
    vi.advanceTimersByTime(SAY_GAP_MS);
    expect(r.text()).toBe(line);
  });
});
