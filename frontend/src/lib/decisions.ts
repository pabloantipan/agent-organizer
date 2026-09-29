import type { merge } from "../../wailsjs/go/models";

type Waiting = Pick<merge.BoardInitiative, "decisions">;

/** Decision records waiting on a ruling in one initiative. */
export const waitingDecisions = (i: Waiting) => (i.decisions ?? []).filter((d) => d.status === "proposed").length;

/** Whose rulings an initiative waits on (FR-10 of lead-side-fixes, 0056):
 *  the owners of its proposed records, distinct, in the order their oldest
 *  record was raised. A record with no owner is "no owner"; an undated one
 *  sorts last; a tie on the date goes to the lower record number. */
export function waitingOwners(i: Waiting): string[] {
  const proposed = (i.decisions ?? []).filter((d) => d.status === "proposed");
  const key = (raised: string | undefined) => raised || "￿";
  proposed.sort((a, b) => key(a.raised).localeCompare(key(b.raised)) || a.number.localeCompare(b.number));
  const owners: string[] = [];
  for (const d of proposed) {
    const o = d.owner?.trim() || "no owner";
    if (!owners.includes(o)) owners.push(o);
  }
  return owners;
}
