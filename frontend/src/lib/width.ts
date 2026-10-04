/** Home's three widths (docs/specs/responsive-home.md, FR-1, FR-7): the class
 *  follows the window, not Home, because the rail's own default depends on
 *  it. One listener on `window` feeds the store; Home, the rail and the rule
 *  box read the store, never a media query of their own. */
export type WidthClass = "compact" | "regular" | "wide";

/** Under this the class is compact: the laptop's windows below full screen
 *  (FR-7, amendment 2: moved from 1280, since at 1280 the expanded rail left
 *  seven rows). The 14-inch laptop at full screen (1512) is regular. */
export const REGULAR_FROM = 1440;
/** From this the class is wide: the ultrawide. FR-13 (amendment 3) moved
 *  it from 1920: at 1920 with the rail expanded the list beside Needs me
 *  kept about 1,150 px and goals fell to 22 characters, so 1920 to 2199 is
 *  regular's one column. */
export const WIDE_FROM = 2200;
/** Regular's top (half of the ultrawide): Home's cap lifts from 1240 to 1480
 *  (FR-3). Not a class of its own; the store keeps it as `roomy`. */
export const ROOMY_FROM = 1720;

export const widthClassOf = (w: number): WidthClass => (w < REGULAR_FROM ? "compact" : w < WIDE_FROM ? "regular" : "wide");

export const roomyOf = (w: number) => w >= ROOMY_FROM && w < WIDE_FROM;

/** The rail's state (FR-2): the lead's stored choice ("1" strip, "0"
 *  expanded) always wins; with none stored, the rail is the strip in the
 *  compact class and expanded elsewhere. The class never writes the choice. */
export const railCollapsedFor = (stored: string | null, cls: WidthClass) =>
  stored === "1" ? true : stored === "0" ? false : cls === "compact";

/** Compact's signals on one line (FR-10): how many of the lozenges, in
 *  order, fit `room` with `gap` between them. All when all fit; otherwise
 *  as many as leave room for the "+N" lozenge (`more` wide) after them, and
 *  never fewer than one, which the cell then cuts. */
export function signalsThatFit(widths: number[], gap: number, room: number, more: number): number {
  const total = widths.reduce((a, w) => a + w, 0) + gap * Math.max(0, widths.length - 1);
  if (total <= room) return widths.length;
  let used = more;
  let n = 0;
  while (n < widths.length && used + gap + widths[n] <= room) { used += gap + widths[n]; n++; }
  return Math.max(1, n);
}

/** How soon a signal folds into "+N" (FR-20 as amended by 0076; leftovers-5
 *  FR-8; design system, Widths: "what gives way first"): live first (a wave
 *  building, live or working seats), then now, then problems, then the
 *  cell's state, and last waiting, the lead's own ("waiting · you") or
 *  anyone's, which is cut to its floor before it folds. Null is blocked,
 *  which never folds and is never cut (leftovers-7 FR-4, home-signals-5 U1:
 *  red never reaches the lead only through a "+N"). */
export type Fold = 0 | 1 | 2 | 3 | 4 | null;
export const FOLD = { live: 0, now: 1, problems: 2, cell: 3, waiting: 4 } as const;

/** Which signals a row shows (FR-20; leftovers-5 FR-8), in their own order.
 *  `floors` are what each keeps at the least, in rendered width: waiting's
 *  `N` and the whole noun ("5 waiting", the names cut), any other whole.
 *  All show when their floors fit `room`; otherwise the foldable ones
 *  leave, the soonest first and, among equals, the last first, until what
 *  stays fits beside the "+N" (`more` wide), so the cell shows wherever it
 *  fits beside a cut waiting. Waiting folds last, after the cell; blocked
 *  never folds (leftovers-7 FR-4). At least one signal stays, which the
 *  cell then cuts. */
export function signalsShown(floors: number[], folds: Fold[], gap: number, room: number, more: number): boolean[] {
  const shown = floors.map(() => true);
  const used = () => {
    const on = floors.filter((_, k) => shown[k]);
    const hidden = on.length < floors.length;
    return on.reduce((a, w) => a + w, 0) + gap * Math.max(0, on.length - 1) + (hidden ? gap + more : 0);
  };
  while (used() > room && shown.filter(Boolean).length > 1) {
    let pick = -1;
    folds.forEach((f, k) => {
      if (!shown[k] || f === null) return;
      if (pick < 0 || f <= folds[pick]!) pick = k;
    });
    if (pick < 0) break;
    shown[pick] = false;
  }
  return shown;
}

/** What a row's signal cell needs so that waiting keeps its floor, blocked
 *  shows whole and the cell's state shows whole beside them (leftovers-5 FR-8,
 *  ranking row 6), with "+N" (`more` wide) for whatever else folds. Home
 *  gives regular's and wide's signal column the widest row's need as its
 *  least, so the cell shows wherever the row can afford it; compact keeps
 *  its own least, since the goal's floor comes first there. */
export function signalsNeed(floors: number[], folds: Fold[], gap: number, more: number): number {
  const keep = floors.filter((_, k) => folds[k] === null || folds[k] === FOLD.cell || folds[k] === FOLD.waiting);
  const rest = floors.length - keep.length;
  return keep.reduce((a, w) => a + w, 0) + gap * Math.max(0, keep.length - 1) + (rest > 0 ? (keep.length > 0 ? gap : 0) + more : 0);
}

/** Compact's row (FR-16): its fixed columns as home.css draws them (rank,
 *  state, phase, the stage as n/m, chevron), the least the signals take
 *  (one lozenge and the "+N"), and what the goal and the next date need. */
export const COMPACT_FIXED = 24 + 136 + 104 + 76 + 24;
export const SIGNALS_MIN = 160;
/** About 30 characters of a goal at --font-size-md (13 px Manrope), when
 *  no goal has been measured (goalFloor). */
export const GOAL_MIN = 224;
/** About 30 characters of goal (the design system's compact goal column). */
export const GOAL_FLOOR_CHARS = 30;

/** The goal column's floor in rendered width (leftovers-5 FR-8, row 2):
 *  the widest of the shown goals' first 30 characters (or the whole goal
 *  when shorter), as `widths` gives them measured in the goal's font.
 *  With no goal measured it is GOAL_MIN. */
export function goalFloor(widths: number[]): number {
  return widths.length ? Math.ceil(Math.max(...widths)) : GOAL_MIN;
}
export const NEXT_W = 96;

/** Which of goal and next date a compact row shows (FR-16): a column gives
 *  way only when the row has no room for it, measured on the row, never by
 *  the class name. `room` is the row's inner width, `id` the id column's,
 *  `gap` the grid's column gap. The goal is kept first; the next date fits
 *  in what is left, alone if the goal could not. A column empty on every
 *  shown row (`empty`, FR-20) has already given way: it is never shown and
 *  takes no room. `goalMin` is the goal's floor (goalFloor). */
export function compactColumns(room: number, id: number, gap: number, empty: Empty = NO_EMPTY, goalMin = GOAL_MIN): { goal: boolean; next: boolean } {
  let used = COMPACT_FIXED + Math.max(id, 96) + 5 * gap + (empty.sig ? 0 : SIGNALS_MIN + gap);
  const goal = used + gap + goalMin <= room;
  if (goal) used += gap + goalMin;
  const next = !empty.next && used + gap + NEXT_W <= room;
  return { goal, next };
}

/** FR-20: the columns whose cell is empty ("—") on every shown row. They
 *  give way before any column with content, in every class. */
export type Empty = { next: boolean; sig: boolean };
export const NO_EMPTY: Empty = { next: false, sig: false };

/** Wide's geometry, as shell.css and home.css draw it: the whole capped at
 *  2,152 px, Needs me 520 px beside the list with a 32 px gap, the list
 *  capped at 1,600 px; the list's row has 12 px of padding on each side and
 *  its fixed columns (rank, state, phase, next date, chevron) and the least
 *  stage and signals take (120 px each). */
export const WIDE_CAP = 2152;
export const NEEDS_W = 520;
export const WIDE_GAP = 32;
export const LIST_CAP = 1600;
export const WIDE_ROW_PAD = 24;
export const WIDE_NEXT_W = 136;
export const WIDE_STAGE_MIN = 120;
export const WIDE_SIG_MIN = 120;
const WIDE_FIXED = 24 + 144 + 104 + 24;
/** About 70 characters of goal (FR-21). */
export const GOAL_CHARS = 70;

/** The goal column wide gives its row (FR-21): the list beside Needs me in
 *  `avail` (the room Home has, after the rail), less the row's other
 *  columns at their least. `id` is the id column's width, `gap` the grid's
 *  column gap; empty columns take nothing (FR-20). */
export function wideGoalRoom(avail: number, id: number, gap: number, empty: Empty = NO_EMPTY): number {
  const list = Math.min(LIST_CAP, Math.min(avail, WIDE_CAP) - NEEDS_W - WIDE_GAP);
  const cols = 9 - (empty.next ? 1 : 0) - (empty.sig ? 1 : 0);
  return list - WIDE_ROW_PAD - WIDE_FIXED - Math.max(id, 96) - WIDE_STAGE_MIN
    - (empty.sig ? 0 : WIDE_SIG_MIN) - (empty.next ? 0 : WIDE_NEXT_W) - gap * (cols - 1);
}

/** Home's class (FR-21): a window of WIDE_FROM or more is wide only while
 *  the goal column beside Needs me keeps `need` (the width of each goal's
 *  first 70 characters, or of the whole goal when shorter, the widest of
 *  them); else it is regular. 2200 is the floor, so under it nothing is
 *  measured. `was` is Home's class now: once wide, Home stays wide until it
 *  misses by more than SLACK, so a scrollbar that comes and goes with the
 *  layout cannot flip it back and forth. */
export const SLACK = 20;
export function homeClassOf(cls: WidthClass, was: WidthClass, avail: number, need: number, id: number, gap: number, empty: Empty = NO_EMPTY): WidthClass {
  if (cls !== "wide") return cls;
  const room = wideGoalRoom(avail, id, gap, empty);
  return room >= need - (was === "wide" ? SLACK : 0) ? "wide" : "regular";
}

/** The shown signals share their column (FR-20; leftovers-5 FR-8): all at
 *  their natural width when they fit; otherwise each is capped at one
 *  width, the same for all (the widest give way first), never below its
 *  own least (`mins`, its floor, or its natural width when that is less).
 *  signalsShown leaves only what fits at its least; should the leasts still
 *  not fit (one signal left in a column narrower than its floor), the cap
 *  goes under them, so the widths always fit `room` and the row never
 *  overflows (S6). */
export function shareRoom(widths: number[], mins: number[], room: number): { widths: number[]; fits: true } {
  if (widths.reduce((a, w) => a + w, 0) <= room) return { widths, fits: true };
  const floor = widths.map((w, k) => Math.min(mins[k], w));
  const under = floor.reduce((a, w) => a + w, 0) > room;
  const least = (k: number) => (under ? 0 : floor[k]);
  const total = (c: number) => widths.reduce((a, w, k) => a + Math.max(least(k), Math.min(w, c)), 0);
  let lo = 0, hi = Math.max(...widths);
  for (let i = 0; i < 40; i++) { const c = (lo + hi) / 2; if (total(c) <= room) lo = c; else hi = c; }
  // A lozenge at its natural width keeps it exactly: rounding 65.4 down
  // to 65 would clip its last letter (WebKit's widths are fractional).
  return { widths: widths.map((w, k) => { const v = Math.max(least(k), Math.min(w, lo)); return v >= w ? w : Math.floor(v); }), fits: true };
}

/** Regular's fixed columns as home.css draws them: state, phase, next date. */
export const REGULAR_FIXED = [144, 96, 96];

/** No cell is cut while another column holds room it does not use
 *  (leftovers-9 FR-2; design system, Widths). `tracks` are the fixed
 *  columns as home.css draws them, `needs` what each takes on its widest
 *  row. While every one fits its track nothing moves. Once one is cut, the
 *  fixed columns share the room they hold together through shareRoom: each
 *  sizes to its widest row, so one's slack goes to the cut one before any
 *  cell is cut, and what is left returns to the flexible columns. Only when
 *  the widest rows together do not fit is anything cut, the widest first. */
export function fixedColumns(tracks: number[], needs: number[]): number[] {
  const want = needs.map((n) => Math.ceil(n));
  if (want.every((n, k) => n <= tracks[k])) return tracks;
  return shareRoom(want, want, tracks.reduce((a, w) => a + w, 0)).widths;
}
