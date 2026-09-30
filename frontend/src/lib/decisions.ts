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

/** How a row or a signal names a record's owner (ui-leftovers FR-10): one
 *  phrase everywhere, "no owner" when the field is empty. */
export const ownerPhrase = (owner: string | undefined) => {
  const o = owner?.trim();
  return o ? `owner ${o}` : "no owner";
};

/** The two sections the rule box shows (ui-leftovers FR-1): the record's
 *  `## Question` and `## Recommendation`, each without its heading; `##
 *  Options` is left out, since the radios carry it. A section the record
 *  lacks is null. Headings match case-insensitively; a section runs to the
 *  next `##` heading, `###` and deeper stay inside it. */
export function recordSections(body: string | undefined): { question: string | null; recommendation: string | null } {
  const found: Record<string, string> = {};
  let name: string | null = null;
  let lines: string[] = [];
  let fence = false;
  const close = () => { if (name && !(name in found)) found[name] = lines.join("\n").trim(); };
  for (const line of (body ?? "").split("\n")) {
    if (/^\s*(```|~~~)/.test(line)) fence = !fence;
    const h = fence ? null : /^##\s+(.+?)\s*#*\s*$/.exec(line);
    if (h) {
      close();
      name = h[1].toLowerCase();
      lines = [];
      continue;
    }
    lines.push(line);
  }
  close();
  const pick = (k: string) => (found[k] ? found[k] : null);
  return { question: pick("question"), recommendation: pick("recommendation") };
}
