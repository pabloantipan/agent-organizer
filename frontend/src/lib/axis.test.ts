import { describe, expect, it } from "vitest";
import {
  HOUR, PX_DAY, PX_HOUR, anchorScroll, buttonAnchor, contextLabel, deeper, endOf, offersHours, revealScroll,
  scaleOf, shallower, sideOf, startOfDay, ticksOf, todayScroll, when, windowOf,
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
