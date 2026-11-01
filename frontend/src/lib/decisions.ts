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
 *  question record (leftovers-49 FR-1, Amendment 1): every item reads
 *  `Q<n> <alt>[ | <alt> ...]`, numbered Q1, Q2, ... in order from 1, one or
 *  more alternatives, none empty, spaces around each `|` trimmed; numbered
 *  any other way, the list is plain. The same shape as `scan.Questions` in
 *  internal/scan/decisions.go, which the rule and the scan read. */
export function questionsOf(options: string[] | undefined): Question[] | null {
  if (!options || options.length === 0) return null;
  const qs: Question[] = [];
  for (const [i, o] of options.entries()) {
    const m = questionItem.exec(o.trim());
    if (!m || m[1] !== `Q${i + 1}`) return null;
    const alts = m[2].split("|").map((a) => a.trim());
    if (alts.some((a) => a === "")) return null;
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

/** A ruled record's chosen as its opened head shows it (leftovers-51 FR-7):
 *  one `Q<n> <alt>` line per answer on a question record, in question order;
 *  the one option on a plain record, or a chosen that names no answer. */
export function chosenLines(options: string[] | undefined, chosen: string): string[] {
  const qs = questionsOf(options);
  const picks = qs ? picksOf(qs, chosen) : {};
  const lines = (qs ?? []).filter((q) => picks[q.label]).map((q) => `${q.label} ${picks[q.label]}`);
  return lines.length > 0 ? lines : [chosen];
}

/** One answer of a ruled question record: its label and the alternative. */
export type Answer = { label: string; alt: string };

/** A ruled question record's answers in question order, or null on a plain
 *  record or a chosen that names no answer, whose line keeps one option. */
export function ruledAnswers(options: string[] | undefined, chosen: string): Answer[] | null {
  const qs = questionsOf(options);
  if (!qs) return null;
  const picks = picksOf(qs, chosen);
  const answers = qs.filter((q) => picks[q.label]).map((q) => ({ label: q.label, alt: picks[q.label] }));
  return answers.length > 0 ? answers : null;
}

/** The least of an alternative a cut answer keeps (rule-questions A1, UW2):
 *  its first word, at most this many characters, then the ellipsis
 *  (`Q1 after…`). An alternative no longer than that is never cut. */
const ALT_FLOOR = 8;

/** The Ruled line's chosen on a question record, quoted, in `room` pixels
 *  as `width` measures text (leftovers-52 FR-4, UW2). Whole while it fits.
 *  When it does not, each answer gets an equal share of the room left by
 *  the quotes and the `, ` between answers; one that fits its share stays
 *  whole and leaves the rest to the others; the others keep their `Q<n>`
 *  whole and cut the alternative with an ellipsis to their share, never
 *  below its floor (ALT_FLOOR), so `Q1 yes` stays whole. A room of 0 gives
 *  the line's floor. */
export function fitAnswers(answers: Answer[], room: number, width: (s: string) => number): string {
  const full = answers.map((a) => `${a.label} ${a.alt}`);
  const quote = (parts: string[]) => `“${parts.join(", ")}”`;
  if (width(quote(full)) <= room) return quote(full);
  let rest = room - width("“”") - width(", ") * (answers.length - 1);
  const open = new Set(full.keys());
  for (let moved = true; moved && open.size > 0;) {
    moved = false;
    const share = rest / open.size;
    for (const i of [...open]) {
      if (width(full[i]) > share) continue;
      open.delete(i);
      rest -= width(full[i]);
      moved = true;
    }
  }
  const share = rest / Math.max(open.size, 1);
  const cut = ({ label, alt }: Answer) => {
    const floor = alt.split(/[-_\s]/)[0].slice(0, ALT_FLOOR).length;
    let out = `${label} ${alt}`;
    for (let k = alt.length - 1; k >= floor && k > 0; k--) {
      out = `${label} ${alt.slice(0, k).replace(/[-_\s]+$/, "")}…`;
      if (width(out) <= share) break;
    }
    return out;
  };
  return quote(answers.map((a, i) => (open.has(i) ? cut(a) : full[i])));
}

/** Pixels a question chosen's line item asks for over its measure: the
 *  canvas and the laid-out line round apart, by 1/64 px and more. */
export const FIT_SLACK = 2;

/** What a question chosen's item asks of the line (FR-4): its basis, the
 *  whole answers, and its floor, every answer at its floor; each FIT_SLACK
 *  over the measure. */
export const answerSizes = (answers: Answer[], width: (s: string) => number) => ({
  basis: width(fitAnswers(answers, Infinity, width)) + FIT_SLACK,
  floor: width(fitAnswers(answers, 0, width)) + FIT_SLACK,
});

/** The text for the room the line gave the item: the fit keeps half the
 *  slack, so a room as wide as the basis asked for reads whole (UI review
 *  U1: one pixel each way cancelled out and cut `start-now`). */
export const fitRoom = (answers: Answer[], room: number, width: (s: string) => number) =>
  fitAnswers(answers, room - FIT_SLACK / 2, width);

/** Each question's words from the record's Question section (FR-9): the
 *  `**Q<n>. …**` line without its markdown and its `Q<n>.`, by label. A
 *  question with no such line is absent. */
export function questionWords(body: string | undefined): Record<string, string> {
  const words: Record<string, string> = {};
  for (const line of (recordSections(body).question ?? "").split("\n")) {
    if (!/^\s*\*\*Q\d+\./.test(line)) continue;
    const plain = unmark(line);
    const m = /^(Q\d+)\.\s*(.*)$/.exec(plain);
    if (m && m[2] && !(m[1] in words)) words[m[1]] = m[2];
  }
  return words;
}

/** A line's text without its markdown (FR-9, review of lf51-rule-words):
 *  a link keeps its text, a code span its content verbatim, and only paired
 *  emphasis markers go (`**x**`, `__x__`, `*x*`, `_x_`), so an `_` inside a
 *  word or a lone `*` (`2*3`) stays. */
function unmark(line: string): string {
  const spans: string[] = [];
  const held = line
    .replace(/`([^`]+)`/g, (_m, code: string) => `\u0000${spans.push(code) - 1}\u0000`)
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1");
  const emphasis = /(^|[^\w*])(\*\*|__|\*|_)(?=\S)(.*?\S)\2(?![\w*])/;
  let out = held;
  for (let prev = ""; prev !== out;) { prev = out; out = out.replace(emphasis, "$1$3"); }
  return out.replace(/\u0000(\d+)\u0000/g, (_m, i: string) => spans[Number(i)]).trim();
}

/** What keeps Rule disabled on a question record (FR-10), in reading order:
 *  `Q2 not answered yet.`, `Q1 and Q2 …`, `Q1, Q2 and Q3 …`, then `Your
 *  words are missing.`; empty when nothing is. */
export function missingWords(qs: Question[], picks: Record<string, string>, words: string): string {
  const open = qs.filter((q) => !picks[q.label]).map((q) => q.label);
  const parts: string[] = [];
  if (open.length > 0) {
    const list = open.length === 1 ? open[0] : `${open.slice(0, -1).join(", ")} and ${open[open.length - 1]}`;
    parts.push(`${list} not answered yet.`);
  }
  if (words.trim() === "") parts.push("Your words are missing.");
  return parts.join(" ");
}
