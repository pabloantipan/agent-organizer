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

/** How soon a signal folds into "+N" (FR-20; design system, Widths: "what
 *  gives way first"): problems first, then now, then live (a wave building,
 *  live or working seats), then a cell in definition. Null never folds:
 *  waiting, the lead's own ("waiting · you", the waits-on-you signal) or
 *  anyone's, and blocked. */
export type Fold = 0 | 1 | 2 | 3 | null;
export const FOLD = { problems: 0, now: 1, live: 2, cell: 3 } as const;

/** Which signals a row shows (FR-20), in their own order: all when all fit
 *  `room`; otherwise the foldable ones leave, the least urgent first and,
 *  among equals, the last first, until what stays fits beside the "+N"
 *  (`more` wide). Signals that never fold stay even when they do not fit:
 *  the cell cuts them with their ellipsis. At least one signal stays. */
export function signalsShown(widths: number[], folds: Fold[], gap: number, room: number, more: number): boolean[] {
  const shown = widths.map(() => true);
  const used = () => {
    const on = widths.filter((_, k) => shown[k]);
    const hidden = on.length < widths.length;
    return on.reduce((a, w) => a + w, 0) + gap * Math.max(0, on.length - 1) + (hidden ? gap + more : 0);
  };
  while (used() > room && shown.filter(Boolean).length > 1) {
    let pick = -1;
    folds.forEach((f, k) => {
      if (!shown[k] || f === null) return;
      if (pick < 0 || f < (folds[pick] as number) || f === folds[pick]) pick = k;
    });
    if (pick < 0) break;
    shown[pick] = false;
  }
  return shown;
}

/** Compact's row (FR-16): its fixed columns as home.css draws them (rank,
 *  state, phase, the stage as n/m, chevron), the least the signals take
 *  (one lozenge and the "+N"), and what the goal and the next date need. */
export const COMPACT_FIXED = 24 + 136 + 104 + 76 + 24;
export const SIGNALS_MIN = 160;
/** About 30 characters of a goal at --font-size-md (13 px Manrope). */
export const GOAL_MIN = 224;
export const NEXT_W = 96;

/** Which of goal and next date a compact row shows (FR-16): a column gives
 *  way only when the row has no room for it, measured on the row, never by
 *  the class name. `room` is the row's inner width, `id` the id column's,
 *  `gap` the grid's column gap. The goal is kept first; the next date fits
 *  in what is left, alone if the goal could not. A column empty on every
 *  shown row (`empty`, FR-20) has already given way: it is never shown and
 *  takes no room. */
export function compactColumns(room: number, id: number, gap: number, empty: Empty = NO_EMPTY): { goal: boolean; next: boolean } {
  let used = COMPACT_FIXED + Math.max(id, 96) + 5 * gap + (empty.sig ? 0 : SIGNALS_MIN + gap);
  const goal = used + gap + GOAL_MIN <= room;
  if (goal) used += gap + GOAL_MIN;
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
