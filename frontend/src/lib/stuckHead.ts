// The stuck record head on Decisions (docs/ux/specs/decisions-view.md §8 as
// amended, dst-ui F1/A2): whether an expanded record is taller than the view
// is decided before ruling and held while its rule box is open. The facts
// line that joins the head while ruling makes the record 12 px shorter; at a
// window in that band, a re-decided tallness unstuck the head and threw it,
// Rule and the box's title above the view.

/** What a record's tallness was when its rule box opened: the record and
 *  the answer measured in its reading layout. */
export type HeldTall = { key: string; tall: boolean };

/** Whether the expanded record `key` sticks. `measured` is its height
 *  against the room now; `ruling` says its box is open; `held` is the last
 *  answer measured while it was not ruling. While ruling, that answer holds;
 *  otherwise the measure decides. */
export function stickNow(key: string, measured: boolean, ruling: boolean, held: HeldTall | null): boolean {
  if (ruling && held && held.key === key) return held.tall;
  return measured;
}

/** The answer to keep for the next ruling: refreshed only while not ruling,
 *  so a box opened later inherits the reading layout's answer. */
export function holdTall(key: string, measured: boolean, ruling: boolean, held: HeldTall | null): HeldTall | null {
  if (ruling) return held && held.key === key ? held : null;
  return held && held.key === key && held.tall === measured ? held : { key, tall: measured };
}
