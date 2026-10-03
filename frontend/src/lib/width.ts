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
