// Which stage Roadmap → Stages opens when a stage tile or the folded bar's
// stage is pressed (initiative-header FR-4, FR-18). By position in the
// roadmap, never by id: a malformed roadmap may repeat an id (the scan
// reports it), and each tile still opens its own stage.

/** The store's `stageFocus` for the stage at `index` (0-based). */
export function stageFocusOf(initiative: string, index: number): string {
  return `${initiative}/${index}`;
}

/** The position `focus` names for this initiative, or null when it names
 *  another initiative, is not a position, or is past the roadmap's end. */
export function stageFocusIndex(focus: string | null, initiative: string, count: number): number | null {
  const prefix = `${initiative}/`;
  if (!focus?.startsWith(prefix)) return null;
  const rest = focus.slice(prefix.length);
  if (!/^\d+$/.test(rest)) return null;
  const k = Number(rest);
  return k < count ? k : null;
}
