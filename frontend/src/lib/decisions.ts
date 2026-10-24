import type { merge } from "../../wailsjs/go/models";
import { uniq } from ".";

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

/** The owners Home's waiting signal names (0060): the lead's own records read
 *  "you", other owners keep their names. The lead is `leadOf` (the cell's
 *  human, else pablo), compared as it compares, trimmed and lower case. */
export const signalOwners = (i: Waiting, lead: string) =>
  uniq(waitingOwners(i).map((o) => (o.toLowerCase() === lead ? "you" : o)));

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

/** One item of a question record's options (leftovers-49 FR-1):
 *  `Q1 a | b | c` is question Q1 with the alternatives a, b and c. */
export type Question = { label: string; alts: string[] };

const questionItem = /^(Q\d+) (.+)$/;

/** The record's options as questions, in order, or null when it is not a
 *  question record: every item reads `Q<n> <alt> | <alt> ...`, two or more
 *  alternatives, none empty, spaces around each `|` trimmed. The same shape
 *  as `scan.Questions` in internal/scan/decisions.go, which the rule and the
 *  scan read. */
export function questionsOf(options: string[] | undefined): Question[] | null {
  if (!options || options.length === 0) return null;
  const qs: Question[] = [];
  for (const o of options) {
    const m = questionItem.exec(o.trim());
    if (!m) return null;
    const alts = m[2].split("|").map((a) => a.trim());
    if (alts.length < 2 || alts.some((a) => a === "")) return null;
    qs.push({ label: m[1], alts });
  }
  return qs;
}

/** The picks so far as the ruling reads (FR-3): `Q1 a, Q2 x`, the questions
 *  in order, `, ` between them; a question not picked yet is left out. */
export const answersOf = (qs: Question[], picks: Record<string, string>) =>
  qs.filter((q) => picks[q.label]).map((q) => `${q.label} ${picks[q.label]}`).join(", ");

/** The picks a chosen line holds, read back (a kept draft): each `Q<n> <alt>`
 *  naming one of that question's alternatives. A piece that opens with no
 *  label belongs to the answer before it, since an alternative may hold ", ". */
export function picksOf(qs: Question[], chosen: string): Record<string, string> {
  const pieces: string[] = [];
  for (const p of chosen.split(", ")) {
    if (pieces.length > 0 && !questionItem.test(p)) pieces[pieces.length - 1] += `, ${p}`;
    else pieces.push(p);
  }
  const picks: Record<string, string> = {};
  for (const p of pieces) {
    const m = questionItem.exec(p.trim());
    const q = m && qs.find((q) => q.label === m[1]);
    if (m && q && q.alts.includes(m[2].trim())) picks[q.label] = m[2].trim();
  }
  return picks;
}

/** Every question has a pick (FR-2). */
export const allAnswered = (qs: Question[], picks: Record<string, string>) => qs.every((q) => !!picks[q.label]);
