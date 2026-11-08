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

/** A rail group's name as the rail and the float list show it: the seeded
 *  group with an empty name reads `No client`; every other name is the
 *  person's and shows exactly as stored, `other` and `Other` included. */
export function railGroupLabel(g: RailGroup): string {
  return g.seed === SEED_NO_CLIENT && !g.name ? NO_CLIENT : g.name;
}

/** The groups "Group by client" seeds: one per client as written, in the
 *  order they first appear, and one seeded group with an empty name for the
 *  initiatives with no client, keyed by its seed so no client name joins it
 *  (leftovers-77 FR-2, AR42). */
export function clientGroups(entries: { id: string; client: string }[]): RailGroup[] {
  const groups = new Map<string, RailGroup>();
  for (const e of entries) {
    const key = e.client ? `client:${e.client}` : "seed";
    const g = groups.get(key) ?? (e.client ? { name: e.client, initiatives: [] } : { name: "", seed: SEED_NO_CLIENT, initiatives: [] });
    g.initiatives!.push(e.id);
    groups.set(key, g);
  }
  return [...groups.values()];
}

/** The groups after the rename field of group `i` is saved with `value`, or
 *  null when nothing is to be written: empty text, or text equal to what the
 *  header shows (so the seed saved as `No client` keeps its name empty, the
 *  app's label). Any other text is stored as written, seed kept
 *  (leftovers-77 FR-3, AR41). */
export function renameGroup<G extends RailGroup>(groups: G[], i: number, value: string): G[] | null {
  const n = value.trim();
  if (!n || n === railGroupLabel(groups[i])) return null;
  return groups.map((g, j) => (j === i ? { ...g, name: n } : g));
}

/** The groups as they are saved: name, initiatives and seed only; and a
 *  group stored before the seed existed, named exactly `other` or `Other`,
 *  whose members are all known and all without a client, saved as the seed
 *  with an empty name (leftovers-77 FR-4). Any other group is saved as
 *  stored. Nothing calls this on read: it runs only when the groups are
 *  saved. `clientOf` answers undefined for an initiative it does not know. */
export function savedGroups(groups: RailGroup[], clientOf: (id: string) => string | undefined): RailGroup[] {
  return groups.map((g) => {
    const initiatives = g.initiatives ?? [];
    const legacy = !g.seed && (g.name === "other" || g.name === "Other") && initiatives.length > 0 && initiatives.every((id) => clientOf(id) === "");
    if (legacy) return { name: "", seed: SEED_NO_CLIENT, initiatives };
    return g.seed ? { name: g.name, initiatives, seed: g.seed } : { name: g.name, initiatives };
  });
}
