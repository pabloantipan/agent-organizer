import type { model } from "../../wailsjs/go/models";
import { daysBetween, parseISO } from "./dates";

// The Decisions sub-view's words (docs/ux/specs/decisions-view.md): the find
// match, the summary line, the turnaround and the record line's name. Pure,
// so the view only lays them out.

type Findable = Pick<model.Decision, "number" | "title" | "chosen" | "body">;

/** Whether a record answers the find field (§2, B7). A query of digits only
 *  is a record number, with or without its padding (`69`, `0069`) and nothing
 *  else; any other query is words, each of which must appear in the title,
 *  the chosen option or the body, case-insensitive, in any order. An empty
 *  query matches everything. */
export function decisionMatches(d: Findable, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  if (/^\d+$/.test(q)) return /^\d+$/.test(d.number ?? "") && Number(d.number) === Number(q);
  const text = `${d.title ?? ""}\n${d.chosen ?? ""}\n${d.body ?? ""}`.toLowerCase();
  return q.split(/\s+/).every((w) => text.includes(w));
}

/** A whole number of days in words: "1 day", "5 days". */
export const dayWords = (n: number) => `${n} ${n === 1 ? "day" : "days"}`;

/** How long a record has waited, in words: "today", "1 day", "5 days" (§9:
 *  said once, never "0d"). */
export const waitedWords = (days: number) => (days < 1 ? "today" : dayWords(days));

/** A ruled record's turnaround (§4, B10): "after 3 days", or null on a ruling
 *  the same day it was raised, or when a date is missing or reads backwards. */
export function turnaroundWords(raised: string | undefined, ruled: string | undefined): string | null {
  const a = parseISO(raised), b = parseISO(ruled);
  if (!a || !b) return null;
  const n = daysBetween(a, b);
  return n >= 1 ? `after ${dayWords(n)}` : null;
}

type Dated = Pick<model.Decision, "number" | "raised" | "ruled">;

/** The summary line (§1, B2), in parts so the view can make the record's
 *  number a link: `lead` then, when something waits, `number` in brackets,
 *  then ` · <week>` when anything was ruled this week. `waiting` is oldest
 *  first; "this week" is the last seven days, today included. */
export type Summary = { lead: string; number: string | null; week: string | null };

export function summaryOf(waiting: Dated[], ruled: Dated[], now: Date): Summary {
  const recent = ruled.filter((d) => {
    const at = parseISO(d.ruled);
    if (!at) return false;
    const n = daysBetween(at, now);
    return n >= 0 && n < 7;
  }).length;
  const week = recent > 0 ? `${recent} ruled this week` : null;
  if (waiting.length === 0) return { lead: "Nothing to rule", number: null, week };
  const first = waiting[0];
  const raised = parseISO(first.raised);
  const age = raised ? daysBetween(raised, now) : 0;
  const one = waiting.length === 1;
  const when = age < 1 ? (one ? "raised today" : "the oldest raised today") : one ? `for ${dayWords(age)}` : `the oldest for ${dayWords(age)}`;
  return { lead: `${waiting.length} to rule, ${when}`, number: first.number, week };
}

/** The summary as one string, the way it reads: what the view shows and what
 *  the tests pin. */
export const summaryText = (s: Summary) => `${s.lead}${s.number ? ` (${s.number})` : ""}${s.week ? ` · ${s.week}` : ""}`;

/** A section heading's count (§2): the total, or "2 of 68" while the find
 *  field filters. */
export const countWords = (matched: number, total: number, filtering: boolean) => (filtering ? `${matched} of ${total}` : `${total}`);

const STATUS: Record<string, string> = { proposed: "waiting", ruled: "ruled", superseded: "superseded", withdrawn: "withdrawn" };

/** A status in the view's words: proposed reads "waiting". */
export const statusWord = (status: string) => STATUS[status] ?? status;

type Named = Pick<model.Decision, "number" | "title" | "status" | "owner" | "raised" | "ruled" | "ruled_by" | "chosen" | "superseded_by">;

/** The record line's accessible name (§9, B14): its visible facts in order,
 *  each once. "0007 Stage normalize: exit met, waiting, owner pablo, 5 days";
 *  a ruled one "0071 Accept…, ruled, “accept as written”, by pablo, 3 Oct,
 *  after 3 days". `initiative` is set on All initiatives; `ruledOn` is the
 *  date as the line shows it. */
export function lineName(d: Named, now: Date, initiative?: string, ruledOn?: string): string {
  const parts = [`${d.number} ${d.title}`];
  if (initiative) parts.push(initiative);
  parts.push(statusWord(d.status));
  if (d.status === "proposed") {
    const o = d.owner?.trim();
    parts.push(o ? `owner ${o}` : "no owner");
    const r = parseISO(d.raised);
    parts.push(waitedWords(r ? daysBetween(r, now) : 0));
  } else if (d.status === "ruled") {
    if (d.chosen) parts.push(`“${d.chosen}”`);
    parts.push(rulerWords(d.ruled_by));
    if (ruledOn) parts.push(ruledOn);
    const t = turnaroundWords(d.raised, d.ruled);
    if (t) parts.push(t);
  } else if (d.superseded_by) {
    parts.push(`by ${d.superseded_by}`);
  }
  return parts.join(", ");
}

/** Who ruled, as the record line shows it and its name says it (row 15,
 *  WCAG 2.5.3): `by pablo`, or `no ruler recorded` where the record names
 *  none (a scanner problem already). */
export const NO_RULER = "no ruler recorded";
export const rulerWords = (ruledBy?: string) => (ruledBy?.trim() ? `by ${ruledBy.trim()}` : NO_RULER);

/** A Timeline row's name and hover title (§5, B11): the number, the title and
 *  the status, which the row no longer shows as a second line. */
export function timelineName(d: Named, initiative?: string): string {
  const facts = [statusWord(d.status), `raised ${d.raised}`];
  if (d.ruled) facts.push(`ruled ${d.ruled}${d.ruled_by ? ` by ${d.ruled_by}` : ""}`);
  if (d.owner) facts.push(`owner ${d.owner}`);
  return `${d.number} ${d.title}, ${initiative ? `${initiative}, ` : ""}${facts.join(", ")}`;
}

/** Ruled's limit (§4, B6): the ten most recent unless all are asked for or a
 *  find is on (find searches every record whatever the limit shows). */
export const RULED_LIMIT = 10;
export function ruledShown<T>(rows: T[], showAll: boolean, filtering: boolean): { shown: T[]; hidden: number } {
  if (showAll || filtering || rows.length <= RULED_LIMIT) return { shown: rows, hidden: 0 };
  return { shown: rows.slice(0, RULED_LIMIT), hidden: rows.length - RULED_LIMIT };
}

/** The three sections and whether each is open (§3): To rule and Ruled open,
 *  the Timeline closed, unless this machine remembers otherwise. A stored
 *  value that is not an object of booleans falls back key by key. */
export type DecSections = { rule: boolean; ruled: boolean; timeline: boolean };
export const DEC_SECTIONS_DEFAULT: DecSections = { rule: true, ruled: true, timeline: false };
export function decSectionsOf(stored: string | null): DecSections {
  let v: unknown = null;
  try { v = stored ? JSON.parse(stored) : null; } catch { v = null; }
  const o = (v && typeof v === "object" ? v : {}) as Record<string, unknown>;
  const pick = (k: keyof DecSections) => (typeof o[k] === "boolean" ? (o[k] as boolean) : DEC_SECTIONS_DEFAULT[k]);
  return { rule: pick("rule"), ruled: pick("ruled"), timeline: pick("timeline") };
}

/** The sections as shown (§3, §6, rows 6 and 8). Precedence, highest first:
 *  a hand toggle made during the current find (`findHand`, dropped when the
 *  find clears); a find's hit, which shows its section open; a landing's
 *  opening for this visit (`visit`, never stored); the stored layout, which
 *  holds only hand toggles. `hits` is null while no find is on. */
export function shownSections(stored: DecSections, visit: Partial<DecSections>, hits: DecSections | null, findHand: Partial<DecSections>): DecSections {
  const one = (k: keyof DecSections) => {
    if (hits && findHand[k] !== undefined) return findHand[k] as boolean;
    if (hits && hits[k]) return true;
    return visit[k] ?? stored[k];
  };
  return { rule: one("rule"), ruled: one("ruled"), timeline: one("timeline") };
}

/** The Timeline's heading count (row 9): while a find is on, `1 of 71`, and
 *  `· 3 hidden` while superseded and withdrawn records are left out, so its
 *  total and Ruled's add up. No count without a find (§3). */
export function timelineCount(matched: number, total: number, hidden: number, filtering: boolean): string | null {
  if (!filtering) return null;
  return `${matched} of ${total}${hidden > 0 ? ` · ${hidden} hidden` : ""}`;
}

/** Ruled's line when it lists nothing (row 5): `Nothing ruled yet.` with no
 *  find on, `no match` only while one is. */
export const emptyRuledWords = (filtering: boolean) => (filtering ? "no match" : "Nothing ruled yet.");
