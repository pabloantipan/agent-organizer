// The two folds of initiatives that are not active, in the rail, its strip
// and the floating list (leftovers-16 FR-2, FR-3; initiatives-view A1, V3):
// Asleep holds the paused ones only, Archived every other status, so an
// archived initiative is never called asleep.

export type Fold = "asleep" | "archived";

export const FOLD_WORD: Record<Fold, string> = { asleep: "Asleep", archived: "Archived" };

/** A fold's heading: `Asleep (3)`; the word alone while filtering. */
export const foldLabel = (fold: Fold, n?: number) => (n === undefined ? FOLD_WORD[fold] : `${FOLD_WORD[fold]} (${n})`);

/** A fold's name at the strip, its glyph's hover and accessible name:
 *  `Asleep, 11 initiatives`. */
export const foldCountName = (fold: Fold, n: number) => `${FOLD_WORD[fold]}, ${n} initiative${n === 1 ? "" : "s"}`;

/** The strip's fold buttons, Asleep then Archived, each only when it holds
 *  any: the glyph over the count, named by `foldCountName`, the ids in the
 *  hover under the name. */
export type StripFold = { fold: Fold; n: number; name: string; title: string };
export function stripFolds(asleep: string[], archived: string[]): StripFold[] {
  const out: StripFold[] = [];
  const add = (fold: Fold, ids: string[], tail: string) => {
    if (!ids.length) return;
    const name = foldCountName(fold, ids.length);
    out.push({ fold, n: ids.length, name, title: `${name}: ${ids.join(", ")}${tail}` });
  };
  add("asleep", asleep, ". Wake one from Initiatives");
  add("archived", archived, "");
  return out;
}
