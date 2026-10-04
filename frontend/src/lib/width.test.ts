import { describe, expect, it } from "vitest";
import { COMPACT_FIXED, shareRoom, signalsNeed, compactColumns, FOLD, GOAL_MIN, homeClassOf, NEXT_W, railCollapsedFor, roomyOf, SIGNALS_MIN, SLACK, signalsShown, signalsThatFit, wideGoalRoom, widthClassOf, type Fold } from "./width";

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

describe("signalsShown (FR-20; leftovers-5 FR-8)", () => {
  // The seven-signal row in Home's order: waiting, blocked, now, wave, live,
  // cell, problems; waiting and blocked at their floor ("5 waiting…").
  const folds: Fold[] = [FOLD.waiting, null, FOLD.now, FOLD.live, FOLD.live, FOLD.cell, FOLD.problems];
  const floors = [70, 65, 50, 140, 60, 130, 80];
  const gap = 4;
  const sum = (ws: number[]) => ws.reduce((a, w) => a + w, 0) + gap * (ws.length - 1);

  it("shows every signal whose floor fits", () => {
    expect(signalsShown(floors, folds, gap, sum(floors), 28)).toEqual(floors.map(() => true));
  });

  it("folds live first, then now, then problems, then the cell (0076)", () => {
    // one px short: the last live signal goes first
    expect(signalsShown(floors, folds, gap, sum(floors) - 1, 28)).toEqual([true, true, true, true, false, true, true]);
    expect(signalsShown(floors, folds, gap, sum([70, 65, 50, 130, 80]) + gap + 28, 28)).toEqual([true, true, true, false, false, true, true]);
    expect(signalsShown(floors, folds, gap, sum([70, 65, 130, 80]) + gap + 28, 28)).toEqual([true, true, false, false, false, true, true]);
    expect(signalsShown(floors, folds, gap, sum([70, 65, 130]) + gap + 28, 28)).toEqual([true, true, false, false, false, true, false]);
    expect(signalsShown(floors, folds, gap, sum([70, 65]) + gap + 28, 28)).toEqual([true, true, false, false, false, false, false]);
  });

  it("keeps the cell beside a waiting at its floor, not at its natural width", () => {
    // waiting's natural width (330) would not leave the cell room; its floor does
    expect(signalsShown([70, 130], [FOLD.waiting, FOLD.cell], gap, 70 + gap + 130, 28)).toEqual([true, true]);
  });

  it("folds waiting after every foldable one, and never blocked (leftovers-7 FR-4)", () => {
    // waiting gives way, not blocked: "1 blocked" stays whole beside "+6"
    expect(signalsShown(floors, folds, gap, sum([70, 65]) + gap + 28 - 1, 28)).toEqual([false, true, false, false, false, false, false]);
    expect(signalsShown([70, 65], [FOLD.waiting, null], gap, 100, 28)).toEqual([false, true]);
    // blocked first in the row changes nothing
    expect(signalsShown([65, 70], [null, FOLD.waiting], gap, 100, 28)).toEqual([true, false]);
  });

  it("never folds blocked, even when it alone does not fit", () => {
    expect(signalsShown([65, 50], [null, FOLD.now], gap, 40, 28)).toEqual([true, false]);
  });

  it("keeps one signal when every signal folds", () => {
    expect(signalsShown([100, 100], [FOLD.now, FOLD.live], gap, 50, 28)).toEqual([true, false]);
    expect(signalsShown([100], [null], gap, 50, 28)).toEqual([true]);
  });
});

describe("signalsNeed (leftovers-5 FR-8)", () => {
  const gap = 4;
  it("is waiting and blocked at their floor, the cell whole and the +N for the rest", () => {
    const folds: Fold[] = [FOLD.waiting, null, FOLD.now, FOLD.live, FOLD.cell, FOLD.problems];
    expect(signalsNeed([75, 65, 45, 108, 114, 70], folds, gap, 27)).toBe(75 + 65 + 114 + 3 * gap + 27);
  });
  it("needs no +N when nothing else folds, and only the +N with nothing kept", () => {
    expect(signalsNeed([75, 114], [FOLD.waiting, FOLD.cell], gap, 27)).toBe(75 + gap + 114);
    expect(signalsNeed([45, 41], [FOLD.now, FOLD.live], gap, 27)).toBe(27);
    expect(signalsNeed([], [], gap, 27)).toBe(0);
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

describe("shareRoom (FR-20)", () => {
  it("leaves every lozenge whole when they fit", () => {
    expect(shareRoom([100, 60, 80], [36, 36, 52], 240)).toEqual({ widths: [100, 60, 80], fits: true });
  });

  it("cuts the widest first, to one cap, within the room", () => {
    const r = shareRoom([330, 66, 125], [36, 36, 52], 230);
    expect(r.fits).toBe(true);
    expect(r.widths[1]).toBeGreaterThanOrEqual(36);
    expect(r.widths[0]).toBe(r.widths[2]);
    expect(r.widths.reduce((a, w) => a + w, 0)).toBeLessThanOrEqual(230);
  });

  it("never cuts a lozenge under its least while the leasts fit", () => {
    const r = shareRoom([330, 66, 125], [70, 36, 65], 180);
    expect(r.widths[0]).toBeGreaterThanOrEqual(70);
    expect(r.widths[1]).toBeGreaterThanOrEqual(36);
    expect(r.widths[2]).toBeGreaterThanOrEqual(65);
    expect(r.widths.reduce((a, w) => a + w, 0)).toBeLessThanOrEqual(180);
  });

  it("always returns fits, its widths within the room, even when the leasts do not fit (S6)", () => {
    for (const room of [100, 40, 1, 0]) {
      const r = shareRoom([330, 66, 125], [70, 36, 65], room);
      expect(r.fits).toBe(true);
      expect(r.widths.reduce((a, w) => a + w, 0)).toBeLessThanOrEqual(room);
      expect(r.widths.every((w) => w >= 0)).toBe(true);
    }
    expect(shareRoom([200], [70], 50)).toEqual({ widths: [50], fits: true });
  });

  it("keeps an uncut lozenge at its exact, fractional width", () => {
    const r = shareRoom([200.6, 65.4], [75, 65.4], 200);
    expect(r.widths[1]).toBe(65.4);
    expect(r.widths[0] + r.widths[1]).toBeLessThanOrEqual(200);
  });

  it("does not raise a lozenge narrower than its least", () => {
    const w = shareRoom([30, 300], [36, 36], 120).widths;
    expect(w[0]).toBe(30);
    expect(w[1]).toBeGreaterThanOrEqual(89);
    expect(w[0] + w[1]).toBeLessThanOrEqual(120);
  });
});
