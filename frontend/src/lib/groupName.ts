/** The no-client group "Group by client" seeds: the app's label, so it is
 *  in the app's sentence case, like `Asleep` and `Archived` (leftovers-74
 *  FR-2; run-report Amendment 10, AR40). */
export const NO_CLIENT = "Other";

/** A rail group's name as the rail and the float list show it. A stored
 *  `other`, exactly, is what the seed wrote before it said `Other`, so it
 *  reads `Other`; every other name is the person's and shows as stored. The
 *  stored value is never rewritten (accepted cost: a person who typed
 *  exactly `other` also reads `Other`). */
export function groupName(stored: string): string {
  return stored === "other" ? NO_CLIENT : stored;
}

/** The groups "Group by client" seeds: one per client as written, in the
 *  order they first appear, the initiatives with no client in `Other`. */
export function clientGroups(entries: { id: string; client: string }[]): { name: string; initiatives: string[] }[] {
  const groups = new Map<string, string[]>();
  for (const e of entries) {
    const name = e.client || NO_CLIENT;
    groups.set(name, [...(groups.get(name) ?? []), e.id]);
  }
  return [...groups].map(([name, initiatives]) => ({ name, initiatives }));
}
