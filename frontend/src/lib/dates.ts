export const DAY = 86400000;

const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/;
// RFC 3339 as git's %cI writes it: a time and an offset (Z or ±hh:mm).
const DATE_TIME = /^\d{4}-\d{2}-\d{2}[Tt ]\d{2}:\d{2}(:\d{2}(\.\d+)?)?([Zz]|[+-]\d{2}:\d{2})$/;

/** A card, record or stage date (`YYYY-MM-DD`, local midnight) or an RFC
 *  3339 time (git's %cI on a branch span); null for anything else. */
export function parseISO(s: string | undefined | null): Date | null {
  if (!s) return null;
  const m = DATE_ONLY.exec(s);
  if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  if (!DATE_TIME.test(s)) return null;
  const d = new Date(s.replace(" ", "T"));
  return isNaN(d.getTime()) ? null : d;
}

/** Whether a string parseISO takes carries a time of day, not a whole day. */
export function hasTime(s: string | undefined | null): boolean {
  return !!s && DATE_TIME.test(s) && parseISO(s) !== null;
}

export function toISO(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function today(): Date {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function addDays(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
}

export function daysBetween(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / DAY);
}

export function monthLabel(d: Date): string {
  return d.toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

export function shortDate(d: Date): string {
  return d.toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** A date as a person reads it (design system, Principles; leftovers-8
 *  FR-5): `24 Sep`, with the year only when it is not `now`'s, `24 Sep
 *  2025`. Takes a Date or what parseISO takes; anything else comes back as
 *  it was, so a malformed value is still shown, never hidden. */
export function dateWords(d: Date | string | undefined | null, now: Date = today()): string {
  const at = typeof d === "string" || d == null ? parseISO(d) : d;
  if (!at) return typeof d === "string" ? d : "";
  const words = `${at.getDate()} ${MONTHS[at.getMonth()]}`;
  return at.getFullYear() === now.getFullYear() ? words : `${words} ${at.getFullYear()}`;
}

/** A moment as a person reads it (leftovers-10 FR-6): the day in words
 *  (`today`, else dateWords) and the clock as `HH:MM`, so a message reads
 *  `today 22:24` or `26 Sep 22:24`, never ISO or a locale's `Sep 26`. */
export function timeWords(at: Date | number, now: Date = new Date()): string {
  const d = typeof at === "number" ? new Date(at) : at;
  if (isNaN(d.getTime())) return "";
  const p = (n: number) => String(n).padStart(2, "0");
  const day = d.toDateString() === now.toDateString() ? "today" : dateWords(d, now);
  return `${day} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

/** Monday-first grid of 6 weeks covering the month. */
export function monthGrid(year: number, month: number): Date[] {
  const first = new Date(year, month, 1);
  const offset = (first.getDay() + 6) % 7;
  const start = addDays(first, -offset);
  return Array.from({ length: 42 }, (_, i) => addDays(start, i));
}
