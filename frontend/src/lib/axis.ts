import { DAY, hasTime, parseISO } from "./dates";

/** The shared time axis of the Gantt-style graphs (Roadmap Cards, Roadmap
 *  Stages, the Decisions Timeline): levels, the window, the scale, ticks, the
 *  day-end rule and the anchor arithmetic (docs/ux/specs/roadmap-time-zoom.md,
 *  T3). Pure: every function takes its "now" and widths as arguments. Times
 *  are epoch milliseconds; days are local days. */

export type Level = "fit" | "days" | "hours";

export const LABEL_W = 240; // the label column, sticky at Days and Hours
export const GUTTER = 24;   // right padding after the lane
export const PX_DAY = 40;
export const PX_HOUR = 64;
export const HOUR = 3600000;
export const QUARTER = HOUR / 4;
const MINOR_LABEL_MIN = 48; // a :15 label shows only when a quarter is this wide

export const LEVEL_WORD: Record<Level, string> = { fit: "Fit", days: "Days", hours: "Hours" };

/** A date as a mark sees it: its first instant and whether it has a time. */
export type When = { at: number; timed: boolean };

export function when(s: string | undefined | null): When | null {
  const d = parseISO(s);
  return d ? { at: d.getTime(), timed: hasTime(s) } : null;
}

export function startOfDay(ms: number): number {
  const d = new Date(ms);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

export function addLocalDays(ms: number, n: number): number {
  const d = new Date(startOfDay(ms));
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n).getTime();
}

/** The day-end rule: a whole-day date covers its day, so it ends at the next
 *  midnight; a time ends where it is. */
export function endOf(w: When): number {
  return w.timed ? w.at : addLocalDays(w.at, 1);
}

/** Whether a graph offers Hours: some mark it draws carries a time (0070). */
export function offersHours(marks: (When | null | undefined)[]): boolean {
  return marks.some((w) => !!w?.timed);
}

export function levelsOf(hours: boolean): Level[] {
  return hours ? ["fit", "days", "hours"] : ["fit", "days"];
}

export function deeper(level: Level, hours: boolean): Level | null {
  const ls = levelsOf(hours);
  return ls[ls.indexOf(level) + 1] ?? null;
}

export function shallower(level: Level): Level | null {
  return level === "hours" ? "days" : level === "days" ? "fit" : null;
}

export type Span = { from: number; to: number };

/** The window a level shows: Fit is the graph's own span; Days is the data
 *  plus a day each end, Hours the data plus 12 hours each end, each widened
 *  to the right to fill the view so the lane never ends short of it, and so
 *  that Today can put now at a third of the view. */
export function windowOf(level: Level, fit: Span, data: Span, view: number, now?: number): Span {
  if (level === "fit") return fit;
  if (level === "days") {
    const from = addLocalDays(data.from, -1);
    let to = addLocalDays(data.to - 1, 2);
    const need = Math.ceil(view / PX_DAY);
    if (daysIndex(from, to) < need) to = addLocalDays(from, need);
    if (now !== undefined) to = Math.max(to, addLocalDays(now, Math.ceil((view * 2) / 3 / PX_DAY) + 1));
    return { from, to };
  }
  const from = Math.floor((data.from - 12 * HOUR) / HOUR) * HOUR;
  let to = Math.ceil((data.to + 12 * HOUR) / HOUR) * HOUR;
  to = Math.max(to, from + Math.ceil(view / PX_HOUR) * HOUR);
  if (now !== undefined) to = Math.max(to, Math.ceil(now / HOUR) * HOUR + Math.ceil((view * 2) / 3 / PX_HOUR) * HOUR);
  return { from, to };
}

/** Whole local days from a's day to b's day. */
function daysIndex(a: number, b: number): number {
  return Math.round((startOfDay(b) - startOfDay(a)) / DAY);
}

export type Scale = {
  level: Level;
  from: number;
  to: number;
  width: number;
  x: (ms: number) => number;
  at: (x: number) => number;
};

/** The pixel scale of a level. Fit is linear over the given width; Days gives
 *  every local day exactly PX_DAY (a 23 or 25 hour day still takes one
 *  column, so the gridlines never drift); Hours is linear, PX_HOUR an hour. */
export function scaleOf(level: Level, w: Span, fitWidth: number): Scale {
  if (level === "days") {
    const x = (ms: number) => {
      const day = startOfDay(ms);
      const len = addLocalDays(day, 1) - day;
      return (daysIndex(w.from, day) + (ms - day) / len) * PX_DAY;
    };
    const at = (px: number) => {
      const i = Math.floor(px / PX_DAY);
      const day = addLocalDays(w.from, i);
      return day + ((px / PX_DAY - i) * (addLocalDays(day, 1) - day));
    };
    return { level, from: w.from, to: w.to, width: x(w.to), x, at };
  }
  if (level === "hours") {
    return {
      level, from: w.from, to: w.to, width: ((w.to - w.from) * PX_HOUR) / HOUR,
      x: (ms) => ((ms - w.from) * PX_HOUR) / HOUR,
      at: (px) => w.from + (px * HOUR) / PX_HOUR,
    };
  }
  const span = Math.max(w.to - w.from, 1);
  const width = Math.max(fitWidth, 1);
  return {
    level, from: w.from, to: w.to, width: fitWidth,
    x: (ms) => ((ms - w.from) * width) / span,
    at: (px) => w.from + (px * span) / width,
  };
}

export type Tick = {
  at: number;
  x: number;
  major: boolean;
  label?: string;
  weekend?: boolean; // Days: Saturday or Sunday, a column to tint
  width?: number;    // Days: the column's width
  midnight?: boolean; // Hours: the tick that names its day
};

const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTH = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const WD = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const two = (n: number) => String(n).padStart(2, "0");

/** `5 Oct`, the short date the marks use. */
export function dayMonth(ms: number): string {
  const d = new Date(ms);
  return `${d.getDate()} ${MON[d.getMonth()]}`;
}

/** `Sat 4 Oct`. */
export function weekdayDayMonth(ms: number): string {
  const d = new Date(ms);
  return `${WD[d.getDay()]} ${d.getDate()} ${MON[d.getMonth()]}`;
}

/** `14:32`. */
export function hhmm(ms: number): string {
  const d = new Date(ms);
  return `${two(d.getHours())}:${two(d.getMinutes())}`;
}

/** Weekly under 90 days, else monthly (design system, Timeline). */
export function fitIsWeekly(s: Span): boolean {
  return (s.to - s.from) / DAY < 90;
}

/** The ticks of a scale between two pixel offsets (the rendered stretch; a
 *  wide lane draws only what is near the view). */
export function ticksOf(s: Scale, fromX = 0, toX = s.width): Tick[] {
  const lo = Math.max(s.from, s.at(Math.max(0, fromX)));
  const hi = Math.min(s.to, s.at(Math.min(s.width, toX)));
  const out: Tick[] = [];
  if (s.level === "fit") {
    if (fitIsWeekly(s)) {
      // Mondays
      let d = startOfDay(lo);
      d = addLocalDays(d, (8 - new Date(d).getDay()) % 7);
      for (; d <= hi; d = addLocalDays(d, 7)) out.push({ at: d, x: s.x(d), major: true, label: dayMonth(d) });
    } else {
      const f = new Date(lo);
      for (let d = new Date(f.getFullYear(), f.getMonth() + 1, 1); d.getTime() <= hi; d = new Date(d.getFullYear(), d.getMonth() + 1, 1)) {
        const t = d.getTime();
        out.push({ at: t, x: s.x(t), major: true, label: d.getMonth() === 0 ? `Jan ${d.getFullYear()}` : MON[d.getMonth()] });
      }
    }
    return out;
  }
  if (s.level === "days") {
    for (let d = startOfDay(lo); d <= hi; d = addLocalDays(d, 1)) {
      const dt = new Date(d);
      const label = dt.getDate() === 1 ? `${MON[dt.getMonth()]} 1` : `${WD[dt.getDay()]} ${dt.getDate()}`;
      out.push({ at: d, x: s.x(d), major: true, label, weekend: dt.getDay() === 0 || dt.getDay() === 6, width: s.x(addLocalDays(d, 1)) - s.x(d) });
    }
    return out;
  }
  const minorLabels = (PX_HOUR / 4) >= MINOR_LABEL_MIN;
  for (let t = Math.floor(lo / QUARTER) * QUARTER; t <= hi; t += QUARTER) {
    const d = new Date(t);
    if (d.getMinutes() === 0) {
      const midnight = d.getHours() === 0;
      out.push({ at: t, x: s.x(t), major: true, midnight, label: midnight ? weekdayDayMonth(t) : `${two(d.getHours())}:00` });
    } else {
      out.push({ at: t, x: s.x(t), major: false, label: minorLabels ? `:${two(d.getMinutes())}` : undefined });
    }
  }
  return out;
}

/** What the sticky label at the axis's left edge says: the month at Days,
 *  the day at Hours, nothing at Fit. */
export function contextLabel(level: Level, ms: number): string {
  const d = new Date(ms);
  if (level === "days") return `${MONTH[d.getMonth()]} ${d.getFullYear()}`;
  if (level === "hours") return weekdayDayMonth(ms);
  return "";
}

/** One pan step for ← and →: a day at Days, an hour at Hours. */
export function stepOf(level: Level): number {
  return level === "days" ? PX_DAY : level === "hours" ? PX_HOUR : 0;
}

export function clampScroll(left: number, s: Scale, reserve: number, view: number): number {
  return Math.max(0, Math.min(left, s.width + reserve - view));
}

/** The instant a level change keeps still and where it sits in the view (px
 *  from the lane's visible left edge). Buttons and keys keep today if it is in
 *  view, else the centre of the view. */
export function buttonAnchor(s: Scale, scrollLeft: number, view: number, now: number): { at: number; offset: number } {
  const xNow = s.x(now) - scrollLeft;
  if (xNow >= 0 && xNow <= view) return { at: now, offset: xNow };
  return { at: s.at(scrollLeft + view / 2), offset: view / 2 };
}

/** The scroll offset that puts `at` back at `offset` in the new scale. */
export function anchorScroll(next: Scale, at: number, offset: number, reserve: number, view: number): number {
  return clampScroll(next.x(at) - offset, next, reserve, view);
}

/** Today (or now) at a third of the lane. */
export function todayScroll(s: Scale, now: number, reserve: number, view: number): number {
  return clampScroll(s.x(now) - view / 3, s, reserve, view);
}

/** Which side of the visible stretch a mark lies wholly on, if any. */
export function sideOf(s: Scale, from: number, to: number, scrollLeft: number, view: number): "left" | "right" | null {
  if (s.x(to) < scrollLeft) return "left";
  if (s.x(from) > scrollLeft + view) return "right";
  return null;
}

/** The scroll offset that brings a mark on one side into view: its nearest
 *  date at a third of the lane from the side it comes in on. */
export function revealScroll(s: Scale, from: number, to: number, side: "left" | "right", reserve: number, view: number): number {
  return clampScroll(side === "left" ? s.x(to) - (view * 2) / 3 : s.x(from) - view / 3, s, reserve, view);
}
