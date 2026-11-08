import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { speaker } from "./liveRegion";
import { railGroupLabel, renameGroup, takenBy, takenLine } from "./railGroup";
import { closeRename, collapseRail } from "./railRename";

// leftovers-81 FR-1, row V1 (run-report A15, AR51): collapsing the rail with
// the rename field open closes it as Escape does. Driven through the close
// path the rail's toggle takes (`collapseRail`) over the real `speaker`, with
// fake timers standing in for the 100 ms gap; no DOM test library.
describe("leftovers-81 V1 (FR-1, AR51): collapsing closes the rename as Escape does", () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  const groups = [{ name: "misc", initiatives: ["a"] }, { name: "acme", initiatives: ["b"] }];

  /** The rail's rename state, a refusal of `typed` on group 0 said through
   *  the speaker; `at` ms of the 100 ms gap elapsed. */
  function refused(typed: string, at: number) {
    const region: string[] = [];
    const s = speaker((m) => region.push(m));
    let editing: number | null = 0;
    let line: string | null = null;
    let collapsed = false;
    let focused = "field";
    const taken = takenBy(groups, 0, typed)!;
    line = takenLine(taken, railGroupLabel(groups[0], groups));
    s.say(line);
    vi.advanceTimersByTime(at);
    const rail = {
      get editing() { return editing; },
      hush: s.hush,
      setRefused: (r: null) => { line = r; },
      setEditing: (i: null) => { editing = i; },
      collapse: () => { collapsed = true; },
      focusToggle: () => { focused = "toggle"; },
    };
    return { region, rail, s, state: () => ({ editing, line, collapsed, focused, said: region[region.length - 1] }) };
  }

  it("a refusal said, then collapse: line and announcer empty, name kept, focus on the toggle", () => {
    const r = refused(" ACME ", 150);
    expect(r.state().said).toBe("A group is already called acme. Type another name, or press Escape to keep misc.");
    const before = JSON.stringify(groups);
    collapseRail({ ...r.rail, editing: r.rail.editing });
    vi.advanceTimersByTime(500);
    expect(r.state()).toEqual({ editing: null, line: null, collapsed: true, focused: "toggle", said: "" });
    // Nothing is saved: the stored groups are as they were, misc kept.
    expect(JSON.stringify(groups)).toBe(before);
    expect(groups[0].name).toBe("misc");
  });

  it("a refusal still 100 ms from being set is never set after the collapse", () => {
    const r = refused("acme", 40);
    collapseRail({ ...r.rail, editing: r.rail.editing });
    vi.advanceTimersByTime(500);
    expect(r.state().said).toBe("");
    expect(r.region.every((m) => m === "")).toBe(true);
  });

  it("with no rename open it only collapses: nothing hushed, focus left alone", () => {
    const hush = vi.fn(), setRefused = vi.fn(), setEditing = vi.fn(), focusToggle = vi.fn(), collapse = vi.fn();
    collapseRail({ editing: null, hush, setRefused, setEditing, collapse, focusToggle });
    expect(collapse).toHaveBeenCalledOnce();
    expect([hush, setRefused, setEditing, focusToggle].every((f) => f.mock.calls.length === 0)).toBe(true);
  });

  it("closeRename (Escape's path too) saves nothing: renameGroup is never reached", () => {
    const r = refused("acme", 150);
    closeRename(r.rail);
    vi.advanceTimersByTime(500);
    expect(r.state()).toMatchObject({ editing: null, line: null, said: "" });
    // What a save of the refused text would have given: nothing to write.
    expect(renameGroup(groups, 0, "acme")).toBeNull();
  });
});
