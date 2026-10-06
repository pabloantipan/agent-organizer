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

export const REVEAL_MARGIN = 24; // a revealed mark's distance from the lane's edges

/** The scroll offset an edge pointer brings a mark into view with (§A1.3):
 *  a mark that fits in the lane with REVEAL_MARGIN each side shows whole,
 *  centred when shorter than a third of the lane, else starting REVEAL_MARGIN
 *  into the lane, so what a bar says after its end (its times, its due) shows
 *  too; a longer one shows its nearer end at a third of the lane in from its
 *  side. The level never changes. */
export function revealScroll(s: Scale, from: number, to: number, side: "left" | "right", reserve: number, view: number): number {
  const a = s.x(from), b = s.x(to), w = b - a;
  let left: number;
  if (w < view / 3) left = (a + b) / 2 - view / 2;
  else if (w + 2 * REVEAL_MARGIN <= view) left = Math.floor(a - REVEAL_MARGIN); // whole pixels: scrollLeft rounds
  else left = side === "left" ? b - (view * 2) / 3 : a - view / 3;
  return clampScroll(left, s, reserve, view);
}

/** The zoom control's buttons that can take focus back (§A1.1). */
export type ZoomButton = "in" | "out" | "fit" | "today";

/** Where focus goes after a control button moved the level to `next`: the
 *  opposite zoom button when the pressed one is now disabled, else nowhere
 *  (it stays). `+` reaching the deepest level hands focus to `−`; `−` or Fit
 *  reaching Fit hand it to `+`. Today never disables itself while pressed. */
export function focusAfter(pressed: ZoomButton, next: Level, hours: boolean): ZoomButton | null {
  if (pressed === "in" && deeper(next, hours) === null) return "out";
  if ((pressed === "out" || pressed === "fit") && next === "fit") return "in";
  return null;
}

/** The sticky context label for a scroll offset: the month (Days) or the
 *  day (Hours) of the first whole unit in view, a day at Days and an hour at
 *  Hours, so a sliver of last month's last day at the lane's edge does not
 *  name last month, and a midnight tick 1-3 px into the lane already names
 *  its new day (design system, Timeline, leftovers-6 FR-1; §A1.6). */
export function contextAt(s: Scale, scrollLeft: number): string {
  return contextLabel(s.level, firstWholeUnit(s, Math.max(scrollLeft, 0)));
}

/** The start of the first whole unit (a day at Days, an hour at Hours) at or
 *  right of `x`; a unit that starts within half a pixel of it counts, since
 *  scrollLeft rounds. */
export function firstWholeUnit(s: Scale, x: number): number {
  const t = s.at(x);
  if (s.level === "hours") {
    const h = Math.floor(t / HOUR) * HOUR;
    return s.x(h) >= x - 0.5 ? h : h + HOUR;
  }
  const d = startOfDay(t);
  return s.x(d) >= x - 0.5 ? d : addLocalDays(d, 1);
}

/** The today label, in the axis (design system, Timeline, as amended by
 *  106a4bd; leftovers-7 FR-10): `today` beside the line at Fit; at Days
 *  `today` on the context row, centred on today's column, and at Hours
 *  `now 14:32` over the line, while today's own tick label is drawn in the
 *  accent (todayTick), so no neighbour's tick gives way. */
export function todayLabel(level: Level, now: number): string {
  return level === "hours" ? `now ${hhmm(now)}` : "today";
}

/** Whether a tick is today's own (leftovers-7 FR-10): at Days the column of
 *  today, at Hours the hour now is in; at Fit none, since a floating tick
 *  is a week or a month. */
export function todayTick(t: Tick, level: Level, now: number): boolean {
  if (level === "days") return t.at === startOfDay(now);
  if (level === "hours") { const h = new Date(now); h.setMinutes(0, 0, 0); return t.major && t.at === h.getTime(); }
  return false;
}

/** Where the today label stands on the lane, in px: today's column's middle
 *  at Days, the line itself at Fit and Hours. */
export function todayAt(s: Scale, now: number): number {
  if (s.level !== "days") return s.x(now);
  const d = startOfDay(now);
  return (s.x(d) + s.x(addLocalDays(d, 1))) / 2;
}

/** A label's box on screen, in CSS pixels (getBoundingClientRect). */
export type Box = { left: number; right: number; top: number; bottom: number };

/** The least room between two labels on one line. */
export const LABEL_GAP = 4;
/** The least room between two tick labels (design system, Timeline,
 *  leftovers-6 FR-4). */
export const TICK_GAP = 12;

/** How far a label moves along the axis to lie whole between `lo` and `hi`
 *  (the lane's visible stretch: the label column's edge and the frame's):
 *  0 when it already does, null when it is wider than the room, so it is
 *  left to its hover title (design system, Timeline: no axis text is cut). */
export function shiftInside(b: { left: number; right: number }, lo: number, hi: number): number | null {
  if (b.right - b.left > hi - lo) return null;
  if (b.left < lo) return lo - b.left;
  if (b.right > hi) return hi - b.right;
  return 0;
}

/** Whether two labels' boxes overlap or sit closer than `gap` side by side. */
export function overlaps(a: Box, b: Box, gap = LABEL_GAP): boolean {
  return a.left < b.right + gap && b.left < a.right + gap && a.top < b.bottom && b.top < a.bottom;
}

const mod = (k: number, n: number) => ((k % n) + n) % n;

/** Labels that would overlap skip one in two until they do not (design
 *  system, Timeline): the smallest step, 1, 2, 4, ..., at which the labels
 *  whose place `k` is a multiple of it stand `gap` apart. The boxes are the
 *  rendered ones, measured in the DOM, never a count of characters; `k` is a
 *  label's place in its series from a fixed origin (seriesIndex), so the
 *  same labels stay while the lane scrolls. */
export function skipStep(labels: (Box & { k: number })[], gap = LABEL_GAP): number {
  const sorted = [...labels].sort((a, b) => a.left - b.left);
  for (let step = 1; step < 1 << 20; step *= 2) {
    const shown = sorted.filter((l) => mod(l.k, step) === 0);
    if (shown.every((l, i) => i === 0 || !overlaps(shown[i - 1], l, gap))) return step;
  }
  return 1 << 20;
}

/** Whether a label at place `k` shows under a skip step. */
export function keptBy(k: number, step: number): boolean {
  return mod(k, step) === 0;
}

/** A tick's place in its series, counted from a fixed origin: months at a
 *  monthly Fit, weeks at a weekly Fit, days at Days, hours at Hours (and
 *  quarters for a minor tick). */
export function seriesIndex(t: Tick, level: Level, weekly: boolean): number {
  const d = new Date(t.at);
  const day = Math.round(startOfDay(t.at) / DAY);
  if (level === "fit") return weekly ? Math.floor(day / 7) : d.getFullYear() * 12 + d.getMonth();
  if (level === "days") return day;
  return t.major ? Math.round(t.at / HOUR) : Math.round(t.at / QUARTER);
}

/** What a bar with a timed end says after it at Hours (§A1.5): `09:12–17:48`,
 *  `09:12–` for an open bar, a whole-day end left blank; nothing when neither
 *  end has a time. */
export function timesLabel(start: When, end: When | null): string {
  const a = start.timed ? hhmm(start.at) : "";
  const b = end?.timed ? hhmm(end.at) : "";
  return a || b ? `${a}–${b}` : "";
}

/** Rows of mark titles the axis stacks at one place before the rest of a
 *  crowd fold into "+N" (design system, Timeline, leftovers-6 FR-4). */
export const TITLE_ROWS = 3;

/** A box `rows` label rows up. */
export const raised = (b: Box, rows: number, step: number): Box => ({ ...b, top: b.top - rows * step, bottom: b.bottom - rows * step });

/** Where each mark title goes (leftovers-6 FR-4): titles in the order given
 *  (left to right), each at the lowest row, 0 to TITLE_ROWS - 1, in which it
 *  overlaps nothing shown, a row being `step` px (the title's own text
 *  height) above the last. `boxes` are the titles at row 0, `obstacles`
 *  what is already placed (the today and context labels). A title that
 *  finds no free row is folded (-1) into the "+N" of the crowd it ran into:
 *  `into` is the index of the title on the top row it overlaps there, else
 *  the nearest title on the top row, else -1. The axis grows to the rows
 *  used (axisGrowth); nothing is ever drawn over another title. */
export function stackTitles(boxes: Box[], step: number, obstacles: Box[] = [], gap = LABEL_GAP, rows = TITLE_ROWS): { row: number[]; into: number[] } {
  const shown: Box[] = [...obstacles];
  const placed: { i: number; b: Box; row: number }[] = [];
  const row = boxes.map(() => -1);
  const into = boxes.map(() => -1);
  boxes.forEach((b0, i) => {
    for (let r = 0; r < rows; r++) {
      const b = raised(b0, r, step);
      if (!shown.some((o) => overlaps(o, b, gap))) {
        shown.push(b);
        placed.push({ i, b, row: r });
        row[i] = r;
        return;
      }
    }
    const top = placed.filter((p) => p.row === rows - 1);
    const b = raised(b0, rows - 1, step);
    const hitTop = top.find((p) => overlaps(p.b, b, gap));
    const centre = (x: Box) => (x.left + x.right) / 2;
    const nearest = [...top].sort((p, q) => Math.abs(centre(p.b) - centre(b0)) - Math.abs(centre(q.b) - centre(b0)))[0];
    into[i] = (hitTop ?? nearest)?.i ?? -1;
  });
  return { row, into };
}

/** How many px the axis grows (leftovers-6 FR-4): enough that the highest
 *  title's top sits at or under `top`, the axis's top edge, measured while
 *  the axis had grown `current`; titles hang from the axis's foot, so they
 *  move down with what it grows. 0 when every title fits ungrown. */
export function axisGrowth(titles: Box[], top: number, current = 0): number {
  if (titles.length === 0) return 0;
  const slack = Math.min(...titles.map((t) => t.top)) - top;
  return Math.max(0, Math.ceil(current - slack - 0.5));
}

/** The row a zoom by button or key keeps in place (U1): the first whose
 *  bottom is below the visible top (the stuck axis's foot or the window's
 *  top), so a row half under the axis still counts; -1 with no rows. */
export function rowInView(rows: { top: number; bottom: number }[], visibleTop: number): number {
  if (rows.length === 0) return -1;
  const i = rows.findIndex((r) => r.bottom > visibleTop + 1);
  return i < 0 ? rows.length - 1 : i;
}
