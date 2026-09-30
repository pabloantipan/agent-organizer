/** Home's three widths (docs/specs/responsive-home.md, FR-1): the class
 *  follows the window, not Home, because the rail's own default depends on
 *  it. One listener on `window` feeds the store; Home, the rail and the rule
 *  box read the store, never a media query of their own. */
export type WidthClass = "compact" | "regular" | "wide";

/** Under this the class is compact: the laptop with something beside the app. */
export const REGULAR_FROM = 1280;
/** From this the class is wide: the ultrawide. */
export const WIDE_FROM = 1920;
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
