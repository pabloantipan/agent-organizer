/** A rail group as stored in the order: `seed` marks the one the app made
 *  and keys it, never its name (leftovers-77 FR-1). */
export type RailGroup = { name: string; initiatives?: string[]; seed?: string };

/** The seed of the group "Group by client" makes for the initiatives with no
 *  client; the only seed there is. */
export const SEED_NO_CLIENT = "no-client";

/** What the seeded group reads while its name is empty: the app's label, in
 *  the app's sentence case (leftovers-77 FR-2, FR-5; run-report Amendment 11,
 *  AR40). */
export const NO_CLIENT = "No client";

/** What the seed with an empty name reads while another group already reads
 *  `No client`: a client's name cannot be refused, so the seed gives way
 *  (leftovers-78 FR-1; run-report Amendment 12, AR43). */
export const NO_CLIENT_LONG = "Initiatives with no client";

/** How two group names compare: trimmed, any case (leftovers-78 FR-1, FR-2). */
const same = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

const isSeed = (g: RailGroup) => g.seed === SEED_NO_CLIENT;

/** A rail group's name as the rail and the float list show it, among the
 *  groups it stands with: the seeded group with an empty name reads `No
 *  client`, or `Initiatives with no client` while another group's name is
 *  `No client` (trimmed, any case; leftovers-78 FR-1, AR43); every other
 *  name is the person's (or the client's) and shows exactly as stored,
 *  `other` and `Other` included. */
export function railGroupLabel(g: RailGroup, among: RailGroup[] = []): string {
  if (!isSeed(g) || g.name) return g.name;
  return among.some((o) => !isSeed(o) && same(o.name, NO_CLIENT)) ? NO_CLIENT_LONG : NO_CLIENT;
}

/** The groups "Group by client" seeds: one per client as written, in the
 *  order they first appear, and one seeded group with an empty name for the
 *  initiatives with no client, keyed by its seed so no client name joins it
 *  (leftovers-77 FR-2, AR42). A client blank or only spaces is no client
 *  (leftovers-78 FR-4, AR45): the scan trims it, and so does this, for a
 *  snapshot another machine wrote before it did. */
export function clientGroups(entries: { id: string; client: string }[]): RailGroup[] {
  const groups = new Map<string, RailGroup>();
  for (const e of entries) {
    const client = (e.client ?? "").trim();
    const key = client ? `client:${client}` : "seed";
    const g = groups.get(key) ?? (client ? { name: client, initiatives: [] } : { name: "", seed: SEED_NO_CLIENT, initiatives: [] });
    g.initiatives!.push(e.id);
    groups.set(key, g);
  }
  return [...groups.values()];
}

/** The label of the other group that already shows `value` (trimmed, any
 *  case), or null when none does: Rename refuses that name in place,
 *  `A group is already called <label>.` (leftovers-78 FR-2, AR43). */
export function takenBy(groups: RailGroup[], i: number, value: string): string | null {
  const n = value.trim();
  if (!n) return null;
  for (let j = 0; j < groups.length; j++) {
    if (j === i) continue;
    const label = railGroupLabel(groups[j], groups);
    if (same(label, n)) return label;
  }
  return null;
}

/** The line Rename shows under the field when `label` is taken: why, then
 *  the way out, the group's current name last (leftovers-79 FR-2, AR47). */
export const takenLine = (label: string, current: string) =>
  `A group is already called ${label}. Type another name, or press Escape to keep ${current}.`;

/** How many characters of a name the visible refusal line quotes before it
 *  cuts it (leftovers-81 FR-3; run-report A15, AR53). */
export const LINE_NAME_MAX = 24;

/** A name as the visible line quotes it: whole up to LINE_NAME_MAX
 *  characters, else its first LINE_NAME_MAX and `…`. Counted by code point,
 *  so a cut never splits a character. */
export function cutName(name: string): string {
  const cs = [...name];
  return cs.length > LINE_NAME_MAX ? cs.slice(0, LINE_NAME_MAX).join("") + "…" : name;
}

/** The refusal as shown under the field and as said by the announcer: the
 *  same sentence, never cut itself; on screen each name it quotes is cut
 *  (`cutName`), so the line keeps to three or four lines at 180 px; said,
 *  both names are whole (leftovers-81 FR-3, AR53). */
export const takenLines = (label: string, current: string) => ({
  shown: takenLine(cutName(label), cutName(current)),
  said: takenLine(label, current),
});

/** The groups after the rename field of group `i` is saved with `value`, or
 *  null when nothing is to be written: empty text, text equal to what the
 *  header shows (so the seed saved unchanged keeps its name empty, the app's
 *  label), or a name another group shows (`takenBy`; leftovers-78 FR-2).
 *  The seed renamed `No client` (trimmed, any case) stores an empty name:
 *  the app's label again, not a literal (leftovers-78 FR-3, AR44). Any other
 *  text is stored as written, seed kept (leftovers-77 FR-3, AR41). */
export function renameGroup<G extends RailGroup>(groups: G[], i: number, value: string): G[] | null {
  const n = value.trim();
  const g = groups[i];
  if (!n || n === railGroupLabel(g, groups) || takenBy(groups, i, n) !== null) return null;
  const name = isSeed(g) && same(n, NO_CLIENT) ? "" : n;
  if (name === g.name) return null;
  return groups.map((o, j) => (j === i ? { ...o, name } : o));
}

/** The groups as they are saved: name, initiatives and seed only. A group
 *  stored before the seed existed, named exactly `other` or `Other`, whose
 *  members are all known and all without a client, is legacy (leftovers-77
 *  FR-4): it is merged into the stored seed when one exists, its
 *  initiatives appended in order and none twice, and becomes the seed with
 *  an empty name only when none exists (leftovers-78 FR-5). At most one
 *  seeded group is ever saved: a second seed merges the same way. Any other
 *  group is saved as stored. Nothing calls this on read: it runs only when
 *  the groups are saved. `clientOf` answers undefined for an initiative it
 *  does not know. */
export function savedGroups(groups: RailGroup[], clientOf: (id: string) => string | undefined): RailGroup[] {
  const legacy = (g: RailGroup) => {
    const initiatives = g.initiatives ?? [];
    return !g.seed && (g.name === "other" || g.name === "Other") && initiatives.length > 0 && initiatives.every((id) => clientOf(id)?.trim() === "");
  };
  // The seed everything seeded merges into: the stored one, else the first legacy group.
  let into = groups.findIndex(isSeed);
  if (into < 0) into = groups.findIndex(legacy);
  const merged: string[] = [];
  if (into >= 0) {
    for (const j of [into, ...groups.map((_, k) => k).filter((k) => k !== into)]) {
      const g = groups[j];
      if (j !== into && !isSeed(g) && !legacy(g)) continue;
      for (const id of g.initiatives ?? []) if (!merged.includes(id)) merged.push(id);
    }
  }
  const out: RailGroup[] = [];
  groups.forEach((g, j) => {
    if (j === into) {
      out.push({ name: isSeed(g) ? g.name : "", initiatives: merged, seed: SEED_NO_CLIENT });
      return;
    }
    if (into >= 0 && (isSeed(g) || legacy(g))) return;
    out.push(g.seed ? { name: g.name, initiatives: g.initiatives ?? [], seed: g.seed } : { name: g.name, initiatives: g.initiatives ?? [] });
  });
  return out;
}
