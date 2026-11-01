import type { merge, model } from "../../wailsjs/go/models";
import { uniq } from ".";

type Waiting = Pick<merge.BoardInitiative, "decisions">;

/** A decision's state (leftovers-54 FR-6; agent-mailbox-specs
 *  expected.json accepted_reading.decision_statuses): open waits on a ruling
 *  (proposed, awaiting-cells), decided was ruled and stands (ruled, applied,
 *  acknowledged), closed is everything else (superseded, withdrawn, and a
 *  status the skill does not know). The same reading as model.Decision.Class
 *  in Go. This file is the one place in lib that names a decision status;
 *  decisionStatusLiterals.test.ts fails on any other. */
export type DecisionClass = "open" | "decided" | "closed";

const OPEN = ["proposed", "awaiting-cells"];
const DECIDED = ["ruled", "applied", "acknowledged"];

export function decisionClass(status: string | undefined): DecisionClass {
  const s = (status ?? "").trim();
  if (OPEN.includes(s)) return "open";
  if (DECIDED.includes(s)) return "decided";
  return "closed";
}

type Stated = Pick<model.Decision, "status">;

/** The record waits on a ruling: Needs me, the header's count, the waiting
 *  owners and the To rule section read this. */
export const isOpen = (d: Stated) => decisionClass(d.status) === "open";

/** The record was ruled and stands: the Ruled list, the timeline's ruled
 *  diamond and the turnaround read this. */
export const isDecided = (d: Stated) => decisionClass(d.status) === "decided";

/** The one status the organizer rules (0019, 0045): proposed. An
 *  awaiting-cells record is open but is Themis's to settle, not the rule
 *  box's (FR-6). */
export const isRulable = (d: Stated) => (d.status ?? "").trim() === "proposed";

/** The class a record's line, bar and dot are drawn with (styles/global.css
 *  .dec.<tone>, .dec-bar.<tone>): open records draw as waiting (proposed),
 *  decided ones as ruled; closed ones keep their status (superseded,
 *  withdrawn), and an unknown status draws as itself, unstyled. */
export const decisionTone = (d: Stated) => {
  const c = decisionClass(d.status);
  return c === "open" ? "proposed" : c === "decided" ? "ruled" : d.status;
};

/** A status in the Decisions view's words: proposed reads "waiting". */
const STATUS_WORDS: Record<string, string> = { proposed: "waiting", "awaiting-cells": "awaiting cells", ruled: "ruled", superseded: "superseded", withdrawn: "withdrawn" };
export const decisionStatusWord = (status: string) => STATUS_WORDS[status] ?? status;

/** How a ruling was given: present (the person ruled), autonomous (an agent
 *  ruled in the person's name, the old "away mode") or a standing rule. */
export type RulingMode = "present" | "autonomous" | "standing rule";
export type Ruling = { person: string; mode: RulingMode | "" };

const LISTED: Record<string, Ruling> = {
  "operator away mode, recommendation taken": { person: "pablo", mode: "autonomous" },
  "(autonomous mode)": { person: "pablo", mode: "autonomous" },
  "(away mode)": { person: "pablo", mode: "autonomous" },
};
const WORD = /^[^\s()]+$/;
const PAREN = /^([^\s()]+)\s+\(([^()]+)\)$/;
const personOf = (w: string) => (w === "operator" ? "pablo" : w);

/** A record's owner as the person compared against the lead: trimmed, lower
 *  case, and `operator` read as pablo (expected.json ruled_by_note, 19d5f44).
 *  Empty when the record names none. Shown owners keep the words as written. */
export const ownerPerson = (owner: string | undefined) => personOf((owner ?? "").trim().toLowerCase());

/** ruled_by read as a person and a mode (leftovers-54 FR-7; expected.json
 *  accepted_reading.ruled_by_reading at 54cf10d): the same rules as
 *  model.ReadRuledBy in Go. Null when the value is refused
 *  (ruled_by_refused): no person, no mode, never a guess. An empty value is
 *  nobody: person "". */
export function readRuledBy(ruledBy: string | undefined): Ruling | null {
  const s = (ruledBy ?? "").trim();
  if (s === "") return { person: "", mode: "" };
  if (LISTED[s]) return LISTED[s];
  if (WORD.test(s)) return { person: personOf(s), mode: "present" };
  const p = PAREN.exec(s);
  if (p) {
    const note = p[2].trim();
    if (note === "autonomous mode" || note === "away mode") return { person: personOf(p[1]), mode: "autonomous" };
    if (note === "standing rule" || /^FR-4\s+\S/.test(note)) return { person: personOf(p[1]), mode: "standing rule" };
    return null;
  }
  const f = s.split(/\s+/);
  if (f.length === 4 && f[1] === "by" && WORD.test(f[0])) {
    const tail = `${f[2]} ${f[3]}`;
    if (tail === "away mode") return { person: personOf(f[0]), mode: "autonomous" };
    if (tail === "standing rule") return { person: personOf(f[0]), mode: "standing rule" };
  }
  return null;
}

type Ruled = Pick<model.Decision, "ruled_by"> & Partial<Pick<model.Decision, "ruler" | "ruler_mode">>;

/** Who ruled a record and how. The scan's reading (`ruler`, `ruler_mode`,
 *  which also weighs a written ruled_mode) when the record carries it, else
 *  ruled_by read here. Null when refused. */
export function rulingOf(d: Ruled): Ruling | null {
  if (d.ruler !== undefined && d.ruler !== null) {
    if (d.ruler === "" && (d.ruled_by ?? "").trim() !== "") return null;
    return { person: d.ruler, mode: (d.ruler_mode ?? "") as Ruling["mode"] };
  }
  return readRuledBy(d.ruled_by);
}

/** The ruler as the app names it (FR-7): the person, with the mode beside it
 *  when it is not present: "pablo", "pablo, autonomous mode", "pablo,
 *  standing rule". Empty when nobody ruled or the reading was refused. */
export function rulerName(d: Ruled): string {
  const r = rulingOf(d);
  if (!r || !r.person) return "";
  if (r.mode === "autonomous") return `${r.person}, autonomous mode`;
  if (r.mode === "standing rule") return `${r.person}, standing rule`;
  return r.person;
}

/** Decision records waiting on a ruling in one initiative. */
export const waitingDecisions = (i: Waiting) => (i.decisions ?? []).filter(isOpen).length;

/** Whose rulings an initiative waits on (FR-10 of lead-side-fixes, 0056):
 *  the owners of its proposed records, distinct, in the order their oldest
 *  record was raised. A record with no owner is "no owner"; an undated one
 *  sorts last; a tie on the date goes to the lower record number. */
export function waitingOwners(i: Waiting): string[] {
  const proposed = (i.decisions ?? []).filter(isOpen);
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
