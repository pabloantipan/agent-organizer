import { describe, expect, it } from "vitest";
import { COMPACT_FIXED, compactColumns, FOLD, GOAL_MIN, homeClassOf, NEXT_W, railCollapsedFor, roomyOf, SIGNALS_MIN, SLACK, signalsShown, signalsThatFit, wideGoalRoom, widthClassOf, type Fold } from "./width";

describe("widthClassOf", () => {
  it("puts each boundary in the class above it", () => {
    expect(widthClassOf(1024)).toBe("compact");
    expect(widthClassOf(1280)).toBe("compact");
    expect(widthClassOf(1439)).toBe("compact");
    expect(widthClassOf(1440)).toBe("regular");
    expect(widthClassOf(1512)).toBe("regular");
    expect(widthClassOf(1720)).toBe("regular");
    expect(widthClassOf(1919)).toBe("regular");
    expect(widthClassOf(1920)).toBe("regular");
    expect(widthClassOf(2199)).toBe("regular");
    expect(widthClassOf(2200)).toBe("wide");
    expect(widthClassOf(3440)).toBe("wide");
  });
});

describe("roomyOf", () => {
  it("is the top of regular only, from 1720", () => {
    expect(roomyOf(1719)).toBe(false);
    expect(roomyOf(1720)).toBe(true);
    expect(roomyOf(1920)).toBe(true);
    expect(roomyOf(2199)).toBe(true);
    expect(roomyOf(2200)).toBe(false);
  });
});

describe("railCollapsedFor", () => {
  it("starts as the strip in compact when nothing is stored", () => {
    expect(railCollapsedFor(null, "compact")).toBe(true);
    expect(railCollapsedFor(null, "regular")).toBe(false);
    expect(railCollapsedFor(null, "wide")).toBe(false);
  });

  it("keeps the lead's stored choice in every class", () => {
    for (const cls of ["compact", "regular", "wide"] as const) {
      expect(railCollapsedFor("0", cls)).toBe(false);
      expect(railCollapsedFor("1", cls)).toBe(true);
    }
  });
});

describe("signalsThatFit", () => {
  it("shows every signal that fits on the line", () => {
    expect(signalsThatFit([60, 50, 40], 4, 158, 24)).toBe(3);
    expect(signalsThatFit([], 4, 10, 24)).toBe(0);
  });

  it("leaves room for the +N after the ones it shows", () => {
    // "+N" (24) + 4 + 60 + 4 + 50 = 142: two fit in 142, one in 140
    expect(signalsThatFit([60, 50, 40], 4, 140, 24)).toBe(1);
    expect(signalsThatFit([60, 50, 40], 4, 142, 24)).toBe(2);
  });

  it("keeps one signal when not even one fits with the +N", () => {
    expect(signalsThatFit([200, 50], 4, 100, 24)).toBe(1);
  });
});

describe("compactColumns", () => {
  const gap = 12;
  const base = COMPACT_FIXED + 150 + SIGNALS_MIN + 6 * gap;

  it("keeps goal and next date while the row has room for both", () => {
    expect(compactColumns(base + 2 * gap + GOAL_MIN + NEXT_W, 150, gap)).toEqual({ goal: true, next: true });
  });

  it("lets the next date give way first, then the goal", () => {
    expect(compactColumns(base + 2 * gap + GOAL_MIN + NEXT_W - 1, 150, gap)).toEqual({ goal: true, next: false });
    expect(compactColumns(base + gap + GOAL_MIN - 1, 150, gap)).toEqual({ goal: false, next: true });
    expect(compactColumns(base + gap + NEXT_W - 1, 150, gap)).toEqual({ goal: false, next: false });
  });

  it("brings each back when the row grows (the same rule, no memory)", () => {
    const sizes = [700, 900, 1100, 900, 700].map((w) => compactColumns(w, 150, gap));
    expect(sizes[0]).toEqual(sizes[4]);
    expect(sizes[1]).toEqual(sizes[3]);
    expect(sizes[2]).toEqual({ goal: true, next: true });
  });

  it("never measures the id column under 96 px", () => {
    expect(compactColumns(base - 150 + 96 + gap + GOAL_MIN, 40, gap).goal).toBe(true);
  });
});

describe("compactColumns with empty columns (FR-20)", () => {
  const gap = 12;
  const base = COMPACT_FIXED + 150 + SIGNALS_MIN + 6 * gap;

  it("never shows a next date that is empty on every row, and gives its room to the goal", () => {
    expect(compactColumns(base + 2 * gap + GOAL_MIN + NEXT_W, 150, gap, { next: true, sig: false })).toEqual({ goal: true, next: false });
  });

  it("does not count the signals' room when they are empty on every row", () => {
    const room = base - SIGNALS_MIN - gap + gap + GOAL_MIN;
    expect(compactColumns(room, 150, gap).goal).toBe(false);
    expect(compactColumns(room, 150, gap, { next: false, sig: true }).goal).toBe(true);
  });
});

describe("signalsShown (FR-20)", () => {
  // The seven-signal row in Home's order: waiting, blocked, now, wave, live, cell, problems.
  const folds: Fold[] = [null, null, FOLD.now, FOLD.live, FOLD.live, FOLD.cell, FOLD.problems];
  const widths = [180, 70, 50, 140, 60, 130, 80];
  const gap = 4;
  const sum = (ws: number[]) => ws.reduce((a, w) => a + w, 0) + gap * (ws.length - 1);

  it("shows every signal that fits", () => {
    expect(signalsShown(widths, folds, gap, sum(widths), 28)).toEqual(widths.map(() => true));
  });

  it("folds problems first, then now, then live, then the cell; waiting and blocked never", () => {
    const room = sum(widths) - 1;
    expect(signalsShown(widths, folds, gap, room, 28)).toEqual([true, true, true, true, true, true, false]);
    const tight = signalsShown(widths, folds, gap, sum([180, 70, 130]) + gap + 28, 28);
    expect(tight).toEqual([true, true, false, false, false, true, false]);
    const tighter = signalsShown(widths, folds, gap, 200, 28);
    expect(tighter).toEqual([true, true, false, false, false, false, false]);
  });

  it("folds now before live", () => {
    const shown = signalsShown(widths, folds, gap, sum([180, 70, 140, 60, 130]) + gap + 28, 28);
    expect(shown).toEqual([true, true, false, true, true, true, false]);
  });

  it("keeps one signal when every signal folds", () => {
    expect(signalsShown([100, 100], [FOLD.now, FOLD.live], gap, 50, 28)).toEqual([false, true]);
  });
});

describe("homeClassOf (FR-21)", () => {
  const gap = 12;
  const need = 520;

  it("is the window's class under the floor", () => {
    expect(homeClassOf("regular", "regular", 1900, 0, 120, gap)).toBe("regular");
    expect(homeClassOf("compact", "compact", 1300, 0, 120, gap)).toBe("compact");
  });

  it("is wide only while the goal column beside Needs me keeps the need", () => {
    // 2200 with the rail expanded: Home has 1,910 px; collapsed, about 2,114.
    expect(wideGoalRoom(1910, 129, gap)).toBe(437);
    expect(homeClassOf("wide", "regular", 1910, need, 129, gap)).toBe("regular");
    expect(homeClassOf("wide", "regular", 1910, 400, 129, gap)).toBe("wide");
    expect(homeClassOf("wide", "regular", 2114, need, 129, gap)).toBe("wide");
  });

  it("gives the goal the room of columns empty on every row", () => {
    expect(wideGoalRoom(1910, 129, gap, { next: true, sig: false })).toBe(437 + 136 + gap);
    expect(homeClassOf("wide", "regular", 1910, need, 129, gap, { next: true, sig: false })).toBe("wide");
  });

  it("stops at the list's cap however wide the window", () => {
    expect(wideGoalRoom(5000, 129, gap)).toBe(wideGoalRoom(2152, 129, gap));
  });

  it("holds wide within the slack, so a scrollbar cannot flip it", () => {
    const room = wideGoalRoom(1910, 129, gap);
    expect(homeClassOf("wide", "wide", 1910, room + SLACK, 129, gap)).toBe("wide");
    expect(homeClassOf("wide", "regular", 1910, room + SLACK, 129, gap)).toBe("regular");
    expect(homeClassOf("wide", "wide", 1910, room + SLACK + 1, 129, gap)).toBe("regular");
  });
});
