import { describe, expect, it } from "vitest";
import {
  HOUR, PX_DAY, PX_HOUR, REVEAL_MARGIN, TICK_GAP, TITLE_ROWS, anchorScroll, axisGrowth, buttonAnchor, contextAt, contextLabel, deeper,
  endOf, firstWholeUnit, focusAfter, todayLabel, stackTitles, offersHours, revealScroll, scaleOf, shallower, sideOf, startOfDay,
  ticksOf, shiftInside, overlaps, skipStep, keptBy, seriesIndex, fitIsWeekly, timesLabel, todayScroll, when, windowOf,
} from "./axis";

const local = (y: number, m: number, d: number, h = 0, min = 0) => new Date(y, m - 1, d, h, min).getTime();

describe("the day-end rule", () => {
  it("ends a whole-day date at the next midnight", () => {
    expect(endOf(when("2026-10-05")!)).toBe(local(2026, 10, 6));
  });
  it("ends a time where it is", () => {
    const w = when("2026-10-02T09:12:00Z")!;
    expect(w.timed).toBe(true);
    expect(endOf(w)).toBe(w.at);
  });
  it("puts a due 5 Oct bar's right edge on the 5/6 boundary at Days", () => {
    const s = scaleOf("days", { from: local(2026, 10, 1), to: local(2026, 10, 10) }, 0);
    expect(s.x(endOf(when("2026-10-05")!))).toBe(5 * PX_DAY);
  });
});

describe("offersHours", () => {
  it("is false when every mark is a whole day and true when one has a time", () => {
    expect(offersHours([when("2026-10-01"), null, when("2026-10-05")])).toBe(false);
    expect(offersHours([when("2026-10-01"), when("2026-10-02T09:12:00-03:00")])).toBe(true);
  });
  it("sets the deepest level", () => {
    expect(deeper("days", false)).toBeNull();
    expect(deeper("days", true)).toBe("hours");
    expect(deeper("fit", false)).toBe("days");
    expect(shallower("fit")).toBeNull();
    expect(shallower("hours")).toBe("days");
  });
});

describe("windows", () => {
  const fit = { from: local(2026, 9, 1), to: local(2026, 11, 1) };
  const data = { from: local(2026, 9, 10), to: local(2026, 10, 4) };
  it("keeps the graph's own span at Fit", () => {
    expect(windowOf("fit", fit, data, 700)).toEqual(fit);
  });
  it("adds a day each end at Days", () => {
    expect(windowOf("days", fit, data, 100)).toEqual({ from: local(2026, 9, 9), to: local(2026, 10, 5) });
  });
  it("adds 12 hours each end at Hours, on the hour", () => {
    const w = windowOf("hours", fit, { from: local(2026, 10, 2, 9, 12), to: local(2026, 10, 2, 17, 48) }, 100);
    expect(w).toEqual({ from: local(2026, 10, 1, 21), to: local(2026, 10, 3, 6) });
  });
  it("leaves room for Today to put now at a third of the view", () => {
    const now = local(2026, 10, 3, 14);
    for (const lvl of ["days", "hours"] as const) {
      const s = scaleOf(lvl, windowOf(lvl, fit, data, 760, now), 0);
      expect(s.x(now) - todayScroll(s, now, 0, 760)).toBeCloseTo(760 / 3);
    }
  });
  it("widens a short window to fill the view", () => {
    const w = windowOf("days", fit, { from: local(2026, 10, 2), to: local(2026, 10, 3) }, 760);
    expect(scaleOf("days", w, 0).width).toBeGreaterThanOrEqual(760);
  });
});

describe("ticks", () => {
  it("is weekly on Mondays at Fit under 90 days", () => {
    const s = scaleOf("fit", { from: local(2026, 9, 1), to: local(2026, 10, 15) }, 900);
    const t = ticksOf(s);
    expect(t.every((k) => new Date(k.at).getDay() === 1)).toBe(true);
    expect(t[0].label).toBe("7 Sep");
  });
  it("is monthly at Fit from 90 days, January with its year", () => {
    const s = scaleOf("fit", { from: local(2026, 10, 15), to: local(2027, 3, 1) }, 900);
    expect(ticksOf(s).map((k) => k.label)).toEqual(["Nov", "Dec", "Jan 2027", "Feb", "Mar"]);
  });
  it("is every day at Days, weekday and date, the 1st as Oct 1, weekends flagged", () => {
    const s = scaleOf("days", { from: local(2026, 9, 29), to: local(2026, 10, 6) }, 0);
    const t = ticksOf(s);
    expect(t.map((k) => k.label)).toEqual(["Tue 29", "Wed 30", "Oct 1", "Fri 2", "Sat 3", "Sun 4", "Mon 5", "Tue 6"]);
    expect(t.filter((k) => k.weekend).map((k) => k.label)).toEqual(["Sat 3", "Sun 4"]);
    expect(t[1].x - t[0].x).toBe(PX_DAY);
  });
  it("is every hour at Hours with quarter-hour minors, midnight as the day", () => {
    const s = scaleOf("hours", { from: local(2026, 10, 3, 23), to: local(2026, 10, 4, 1) }, 0);
    const t = ticksOf(s);
    expect(t.filter((k) => k.major).map((k) => k.label)).toEqual(["23:00", "Sun 4 Oct", "01:00"]);
    expect(t.filter((k) => !k.major)).toHaveLength(6);
    expect(t.filter((k) => !k.major).every((k) => k.label === undefined)).toBe(true); // 16 px < 48 px
    expect(t[4].x - t[0].x).toBe(PX_HOUR);
  });
  it("draws only the stretch asked for", () => {
    const s = scaleOf("days", { from: local(2026, 1, 1), to: local(2027, 1, 1) }, 0);
    expect(ticksOf(s, 400, 800).length).toBeLessThanOrEqual(12);
  });
  it("keeps Days columns 40 px across a daylight-saving change", () => {
    // whichever zone the test runs in, every day is one column
    const s = scaleOf("days", { from: local(2026, 1, 1), to: local(2027, 1, 1) }, 0);
    const t = ticksOf(s);
    expect(t.every((k, i) => k.x === i * PX_DAY)).toBe(true);
  });
});

describe("context label", () => {
  it("names the month at Days and the day at Hours", () => {
    expect(contextLabel("days", local(2026, 10, 14))).toBe("October 2026");
    expect(contextLabel("hours", local(2026, 10, 4, 3))).toBe("Sun 4 Oct");
    expect(contextLabel("fit", local(2026, 10, 4))).toBe("");
  });
});

describe("anchors", () => {
  const fitW = { from: local(2026, 9, 1), to: local(2026, 11, 1) };
  const fit = scaleOf("fit", fitW, 760);
  const days = scaleOf("days", windowOf("days", fitW, fitW, 760), 0);
  it("keeps the instant under the pointer under it", () => {
    const offset = 500;
    const at = fit.at(offset);
    const left = anchorScroll(days, at, offset, 0, 760);
    expect(Math.abs(days.x(at) - left - offset)).toBeLessThan(1);
  });
  it("keeps today when it is in view, else the centre", () => {
    const now = local(2026, 10, 3, 14);
    expect(buttonAnchor(fit, 0, 760, now)).toEqual({ at: now, offset: fit.x(now) });
    const far = buttonAnchor(days, 0, 760, now);
    expect(far.offset).toBe(380);
    expect(far.at).toBe(days.at(380));
  });
  it("clamps to the lane", () => {
    expect(anchorScroll(days, fitW.from, 500, 0, 760)).toBe(0);
    expect(anchorScroll(days, fitW.to, 0, 0, 760)).toBe(days.width - 760);
  });
  it("puts today at a third of the view", () => {
    const now = local(2026, 10, 3, 12);
    expect(days.x(now) - todayScroll(days, now, 0, 760)).toBeCloseTo(760 / 3);
  });
  it("finds a mark out of view and brings it back", () => {
    const from = local(2026, 9, 2), to = local(2026, 9, 3);
    const left = days.x(local(2026, 10, 1));
    expect(sideOf(days, from, to, left, 760)).toBe("left");
    const back = revealScroll(days, from, to, "left", 0, 760);
    expect(sideOf(days, from, to, back, 760)).toBeNull();
    expect(sideOf(days, local(2026, 10, 2), local(2026, 10, 3), left, 760)).toBeNull();
  });
  it("starts a day at its midnight", () => {
    expect(startOfDay(local(2026, 10, 3, 17, 5))).toBe(local(2026, 10, 3));
    expect(HOUR).toBe(3600000);
  });
});

describe("focus at the control's ends (A15)", () => {
  it("hands focus to the opposite zoom button when the pressed one disables", () => {
    expect(focusAfter("in", "days", false)).toBe("out");   // Days is deepest
    expect(focusAfter("in", "days", true)).toBeNull();     // Hours is still offered
    expect(focusAfter("in", "hours", true)).toBe("out");
    expect(focusAfter("out", "fit", true)).toBe("in");
    expect(focusAfter("fit", "fit", false)).toBe("in");
    expect(focusAfter("out", "days", true)).toBeNull();    // − still enabled at Days
  });
  it("never moves focus from Today, which never disables itself", () => {
    expect(focusAfter("today", "days", false)).toBeNull();
    expect(focusAfter("today", "hours", true)).toBeNull();
  });
  it("leaves no level where the pressed button disables without a target", () => {
    for (const hours of [false, true]) {
      for (const lvl of ["fit", "days", "hours"] as const) {
        if (lvl === "hours" && !hours) continue;
        const inDisabled = deeper(lvl, hours) === null;
        if (inDisabled) expect(focusAfter("in", lvl, hours)).toBe("out");
        if (lvl === "fit") { expect(focusAfter("out", lvl, hours)).toBe("in"); expect(focusAfter("fit", lvl, hours)).toBe("in"); }
      }
    }
  });
});

describe("an edge pointer shows the whole mark (A18)", () => {
  const w = { from: local(2026, 10, 1, 0), to: local(2026, 10, 5, 0) };
  const s = scaleOf("hours", w, 0);
  const view = 760;
  const beta = { from: local(2026, 10, 2, 9, 12), to: local(2026, 10, 2, 17, 48) }; // 550 px
  it("shows a mark that fits whole, 24 px clear of the edges", () => {
    const fromRight = s.x(local(2026, 10, 3, 12));
    expect(sideOf(s, beta.from, beta.to, fromRight, view)).toBe("left");
    const left = revealScroll(s, beta.from, beta.to, "left", 0, view);
    expect(s.x(beta.from) - left).toBeGreaterThanOrEqual(REVEAL_MARGIN);
    expect(s.x(beta.from) - left).toBeLessThan(REVEAL_MARGIN + 1);
    expect(Number.isInteger(left)).toBe(true);
    expect(s.x(beta.to) - left).toBeLessThanOrEqual(view - REVEAL_MARGIN);
    const right = revealScroll(s, beta.from, beta.to, "right", 0, view);
    expect(s.x(beta.from) - right).toBeGreaterThanOrEqual(REVEAL_MARGIN);
  });
  it("centres a mark shorter than a third of the lane", () => {
    const a = local(2026, 10, 2, 12), b = local(2026, 10, 2, 13);
    const left = revealScroll(s, a, b, "left", 0, view);
    expect((s.x(a) + s.x(b)) / 2 - left).toBeCloseTo(view / 2);
  });
  it("puts a mark longer than the lane's nearer end at a third from its side", () => {
    const a = local(2026, 10, 2, 0), b = local(2026, 10, 3, 0); // 1536 px
    expect(s.x(a) - revealScroll(s, a, b, "right", 0, view)).toBeCloseTo(view / 3);
    expect(s.x(b) - revealScroll(s, a, b, "left", 0, view)).toBeCloseTo((view * 2) / 3);
  });
});

describe("axis labels (A20)", () => {
  const s = scaleOf("hours", { from: local(2026, 10, 3, 20), to: local(2026, 10, 4, 6) }, 0);
  const midnight = s.x(local(2026, 10, 4));
  it("names the new day once a midnight tick is 1-3 px into the lane", () => {
    for (const into of [1, 2, 3]) expect(contextAt(s, midnight - into)).toBe("Sun 4 Oct");
    // the 23:00 hour is whole in view, so the day is still Saturday
    expect(contextAt(s, midnight - PX_HOUR)).toBe("Sat 3 Oct");
  });
});

describe("the first whole unit in view names the context (leftovers-6 FR-1)", () => {
  const s = scaleOf("days", { from: local(2026, 9, 20), to: local(2026, 10, 20) }, 0);
  const oct1 = s.x(local(2026, 10, 1));
  it("names October once a sliver of 30 Sep is all of September left in view", () => {
    expect(contextAt(s, oct1 - 1)).toBe("October 2026");
    expect(contextAt(s, oct1 - PX_DAY + 1)).toBe("October 2026");
    expect(firstWholeUnit(s, oct1 - 1)).toBe(local(2026, 10, 1));
  });
  it("names September while 30 Sep is whole in view, and a day exactly at the edge counts", () => {
    expect(contextAt(s, oct1 - PX_DAY)).toBe("September 2026");
    expect(contextAt(s, oct1)).toBe("October 2026");
  });
  it("names the month scrolled to mid-month", () => {
    expect(contextAt(s, s.x(local(2026, 10, 14)) + 10)).toBe("October 2026");
  });
});

describe("the today label (leftovers-6 FR-1)", () => {
  it("says the day at Days and Hours, today alone at Fit", () => {
    const sat3 = local(2026, 10, 3, 14, 32);
    expect(todayLabel("days", sat3)).toBe("today · Sat 3");
    expect(todayLabel("hours", sat3)).toBe("now 14:32 · Sat 3");
    expect(todayLabel("fit", sat3)).toBe("today");
  });
});

describe("mark titles stack, then fold (leftovers-6 FR-4)", () => {
  const box = (left: number, right: number, top = 100, bottom = 116) => ({ left, right, top, bottom });
  it("stacks titles on one date a row each, up to three", () => {
    const three = [box(500, 580), box(500, 560), box(500, 600)];
    expect(stackTitles(three, 16)).toEqual({ row: [0, 1, 2], into: [-1, -1, -1] });
  });
  it("folds a fourth into the top row's title, so it reads +1 there", () => {
    const four = [box(500, 580), box(500, 560), box(500, 600), box(500, 590)];
    const { row, into } = stackTitles(four, 16);
    expect(row).toEqual([0, 1, 2, -1]);
    expect(into[3]).toBe(2);
    expect(TITLE_ROWS).toBe(3);
  });
  it("leaves titles that do not touch on the first row", () => {
    expect(stackTitles([box(100, 160), box(200, 260)], 16).row).toEqual([0, 0]);
  });
  it("stacks a title past an obstacle: the today label", () => {
    expect(stackTitles([box(500, 580)], 16, [box(540, 620)]).row).toEqual([1]);
  });
  it("grows the axis by what the highest row needs, and gives it back", () => {
    // the axis's top at 70: a title whose top is at 62 needs 8 px more
    expect(axisGrowth([box(0, 10, 62, 78), box(0, 10, 90, 106)], 70)).toBe(8);
    expect(axisGrowth([box(0, 10, 84, 100)], 70)).toBe(0);
    // grown 16 for a row that is gone: its title now sits 20 px under the top
    expect(axisGrowth([box(0, 10, 90, 106)], 70, 16)).toBe(0);
    // grown 16 and still needed: the title's top is at the axis's top
    expect(axisGrowth([box(0, 10, 70, 86)], 70, 16)).toBe(16);
    expect(axisGrowth([], 70, 16)).toBe(0);
  });
});

describe("axis labels are placed on their rendered boxes (leftovers-4 FR-11)", () => {
  const box = (left: number, right: number, top = 0, bottom = 14) => ({ left, right, top, bottom });
  it("moves a label inside the room, or leaves it to its title when wider", () => {
    expect(shiftInside(box(250, 300), 240, 1000)).toBe(0);
    expect(shiftInside(box(220, 300), 240, 1000)).toBe(20);   // under the label column
    expect(shiftInside(box(980, 1030), 240, 1000)).toBe(-30); // past the frame's edge
    expect(shiftInside(box(0, 800), 240, 1000)).toBeNull();
  });
  it("counts labels on two lines as apart, and a gap under 4 px as touching", () => {
    expect(overlaps(box(0, 50), box(52, 90))).toBe(true);
    expect(overlaps(box(0, 50), box(54, 90))).toBe(false);
    expect(overlaps(box(0, 50, 0, 14), box(20, 90, 14, 28))).toBe(false);
  });
  it("skips one in two until no two shown labels overlap", () => {
    // 40 px labels every 30 px: every other one leaves 20 px, enough
    const ls = Array.from({ length: 10 }, (_, k) => ({ ...box(k * 30, k * 30 + 40), k }));
    expect(skipStep(ls)).toBe(2);
    // every 12 px: one in four
    const tight = Array.from({ length: 10 }, (_, k) => ({ ...box(k * 12, k * 12 + 40), k }));
    expect(skipStep(tight)).toBe(4);
    expect(skipStep(ls.map((l) => ({ ...l, left: l.k * 60, right: l.k * 60 + 40 })))).toBe(1);
  });
  it("keeps tick labels at least 12 px apart (leftovers-6 FR-4)", () => {
    // 36 px labels 41 px apart leave 5 px: at TICK_GAP every other one goes
    const ticks = Array.from({ length: 10 }, (_, k) => ({ ...box(k * 41, k * 41 + 36), k }));
    expect(skipStep(ticks)).toBe(1);
    expect(skipStep(ticks, TICK_GAP)).toBe(2);
    const kept = ticks.filter((t) => keptBy(t.k, skipStep(ticks, TICK_GAP)));
    for (let i = 1; i < kept.length; i++) expect(kept[i].left - kept[i - 1].right).toBeGreaterThanOrEqual(12);
  });
  it("keeps the same labels while the lane scrolls: the place counts from a fixed origin", () => {
    const at = (from: number) => Array.from({ length: 6 }, (_, i) => ({ ...box(i * 30, i * 30 + 40), k: from + i }));
    const step = skipStep(at(7));
    expect(at(7).filter((l) => keptBy(l.k, step)).map((l) => l.k)).toEqual([8, 10, 12]);
    expect(at(8).filter((l) => keptBy(l.k, step)).map((l) => l.k)).toEqual([8, 10, 12]);
  });
  it("numbers a tick in its series: weeks, months, days, hours", () => {
    const fitW = scaleOf("fit", { from: local(2026, 9, 1), to: local(2026, 10, 15) }, 700);
    expect(fitIsWeekly(fitW)).toBe(true);
    const w = ticksOf(fitW).map((t) => seriesIndex(t, "fit", true));
    w.slice(1).forEach((k, i) => expect(k - w[i]).toBe(1));
    const fitM = scaleOf("fit", { from: local(2025, 11, 1), to: local(2026, 6, 1) }, 700);
    const m = ticksOf(fitM).map((t) => seriesIndex(t, "fit", false));
    m.slice(1).forEach((k, i) => expect(k - m[i]).toBe(1));
    const d = ticksOf(scaleOf("days", { from: local(2026, 10, 20), to: local(2026, 11, 5) }, 0)).map((t) => seriesIndex(t, "days", false));
    d.slice(1).forEach((k, i) => expect(k - d[i]).toBe(1)); // across the DST change
    const h = ticksOf(scaleOf("hours", { from: local(2026, 10, 3, 20), to: local(2026, 10, 4, 6) }, 0)).filter((t) => t.major).map((t) => seriesIndex(t, "hours", false));
    h.slice(1).forEach((k, i) => expect(k - h[i]).toBe(1));
  });
});

describe("a timed bar's times (A19)", () => {
  const a = { at: local(2026, 10, 2, 9, 12), timed: true }, b = { at: local(2026, 10, 2, 17, 48), timed: true };
  it("says both ends, an open end, or nothing for whole days", () => {
    expect(timesLabel(a, b)).toBe("09:12–17:48");
    expect(timesLabel(a, null)).toBe("09:12–");
    expect(timesLabel(a, when("2026-10-05"))).toBe("09:12–");
    expect(timesLabel(when("2026-10-01")!, when("2026-10-05"))).toBe("");
  });
});
