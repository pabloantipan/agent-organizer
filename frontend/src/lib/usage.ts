// The Usage view's pure helpers (docs/specs/usage.md FR-5, docs/ux/specs/
// usage.md). Money is only ever what App.Usage carries, summed or formatted
// here, never computed from tokens (0098: no price table). Money shows in
// the Usage view only (FR-6, 0099); everywhere else the helpers that speak
// tokens are the ones to use.
import { dateWords, parseISO } from "./dates";

/** The four token kinds, in the order the row carries them. */
export type Kinds = { input: number; output: number; cache_read: number; cache_write: number };

/** A row of a cut, as App.Usage returns it (usage.Row). */
export type UsageRow = Kinds & {
  key: string;
  name: string;
  initiative?: string;
  cards?: string[];
  money: number;
  share: number;
  tokens: number;
  sessions: number;
  without_cost: number;
  not_attributed: boolean;
  reasons?: { reason: string; sessions: number }[];
  members?: { id: string; name: string; role: string }[];
};

/** A line of the Sessions list (usage.SessionRow). */
export type UsageSession = Kinds & {
  id: string;
  name: string;
  initiative: string;
  task: string;
  task_title: string;
  role: string;
  reason?: string;
  model: string;
  start: string;
  end: string;
  minutes: number;
  running: boolean;
  tokens: number;
  money?: number | null;
  cost_from: string;
};

/** One week in sum (usage.Totals). */
export type UsageTotals = Kinds & {
  week: string;
  start: string;
  end: string;
  money: number;
  tokens: number;
  sessions: number;
  hours: number;
  running: number;
  without_cost: number;
};

export type WeekPoint = { week: string; start: string; money: number; tokens: number; sessions: number; from?: string };

export const CUTS = ["initiative", "role", "task", "model"] as const;
export type Cut = (typeof CUTS)[number];
export const NOT_ATTRIBUTED = "Not attributed";

/** `$84.20`, `$3,371.94`; null (no cost recorded) is `—`. */
export function money(n: number | null | undefined): string {
  if (n == null || !isFinite(n)) return "—";
  const sign = n < 0 ? "−" : "";
  const [whole, cents] = Math.abs(n).toFixed(2).split(".");
  return `${sign}$${whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}.${cents}`;
}

/** A token count as data reads it: `25.0M`, `830k`, `8.3k`, `412`, `1.2B`. */
export function compact(n: number): string {
  const a = Math.abs(n);
  if (a >= 1e9) return `${(n / 1e9).toFixed(1)}B`;
  // 999,950 would round to 1000.0k: it reads as a million.
  if (a >= 999_950) return `${(n / 1e6).toFixed(1)}M`;
  if (a >= 9_995) return `${Math.round(n / 1e3)}k`;
  if (a >= 1e3) return `${(n / 1e3).toFixed(1)}k`;
  return String(Math.round(n));
}

export const KIND_NAMES: Record<keyof Kinds, string> = { input: "input", output: "output", cache_read: "cache read", cache_write: "cache write" };
const KIND_KEYS = Object.keys(KIND_NAMES) as (keyof Kinds)[];

/** The four kinds, largest first: `cache read 38.0M · cache write 1.5M ·
 *  input 1.1M · output 0.6M` (her Tokens tile; ties keep the row's order). */
export function kindsLargestFirst(k: Kinds): { kind: keyof Kinds; name: string; value: number }[] {
  return KIND_KEYS.map((kind) => ({ kind, name: KIND_NAMES[kind], value: k[kind] ?? 0 }))
    .sort((a, b) => b.value - a.value);
}
export const kindsLine = (k: Kinds) => kindsLargestFirst(k).map((x) => `${x.name} ${compact(x.value)}`).join(" · ");

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** A week's days in words: `6–12 Oct`, `29 Sep–5 Oct`, the year only when
 *  it is not now's (`29 Dec 2025–4 Jan`). */
export function weekRange(start: string, end: string, now: Date = new Date()): string {
  const s = parseISO(start), e = parseISO(end);
  if (!s || !e) return start;
  const yearOf = (d: Date) => (d.getFullYear() === now.getFullYear() ? "" : ` ${d.getFullYear()}`);
  if (s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear()) return `${s.getDate()}–${e.getDate()} ${MONTHS[e.getMonth()]}${yearOf(e)}`;
  return `${s.getDate()} ${MONTHS[s.getMonth()]}${s.getFullYear() !== e.getFullYear() ? yearOf(s) : ""}–${e.getDate()} ${MONTHS[e.getMonth()]}${yearOf(e)}`;
}

/** The Sunday of a week that starts on `start` (YYYY-MM-DD). */
export function weekEnd(start: string): string {
  const s = parseISO(start);
  if (!s) return start;
  const e = new Date(s.getFullYear(), s.getMonth(), s.getDate() + 6);
  return `${e.getFullYear()}-${String(e.getMonth() + 1).padStart(2, "0")}-${String(e.getDate()).padStart(2, "0")}`;
}

/** A week's days as the picker and the week list say them: the first
 *  recorded week starts mid-week and reads `from 30 Sep`. */
export function weekDays(p: { start: string; from?: string }, now: Date = new Date()): string {
  if (p.from) return `from ${dateWords(p.from, now)}`;
  return weekRange(p.start, weekEnd(p.start), now);
}

/** The picker's label: `This week · 6–12 Oct`, `Last week · …`, else the days. */
export function weekLabel(p: { week: string; start: string; from?: string }, thisWeek: string, now: Date = new Date()): string {
  const days = weekDays(p, now);
  if (p.week === thisWeek) return `This week · ${days}`;
  if (p.week === shiftWeek(thisWeek, -1)) return `Last week · ${days}`;
  return days;
}

/** The bar's axis label: the week's Monday, or its first recorded day. */
export const barLabel = (p: { start: string; from?: string }, now: Date = new Date()) => dateWords(p.from || p.start, now);

/** The ISO week (Monday first, local) a day falls in: `2026-W41`. */
export function isoWeekOf(d: Date): string {
  const t = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const dow = (t.getDay() + 6) % 7; // Monday 0
  t.setDate(t.getDate() - dow + 3); // the week's Thursday names its year
  const year = t.getFullYear();
  // Days since 1 January, counted on calendar days so a DST change cannot
  // shave an hour off a week.
  const day = Math.round((Date.UTC(year, t.getMonth(), t.getDate()) - Date.UTC(year, 0, 1)) / 86400000);
  const week = 1 + Math.floor(day / 7);
  return `${year}-W${String(week).padStart(2, "0")}`;
}

/** The Monday of an ISO week, local. */
export function mondayOf(week: string): Date | null {
  const m = /^(\d{4})-W(\d{2})$/.exec(week);
  if (!m) return null;
  const jan4 = new Date(+m[1], 0, 4);
  const mon = new Date(jan4.getFullYear(), 0, 4 - ((jan4.getDay() + 6) % 7));
  return new Date(mon.getFullYear(), mon.getMonth(), mon.getDate() + 7 * (+m[2] - 1));
}

/** The week `n` weeks after `week` (negative: before). */
export function shiftWeek(week: string, n: number): string {
  const mon = mondayOf(week);
  if (!mon) return week;
  return isoWeekOf(new Date(mon.getFullYear(), mon.getMonth(), mon.getDate() + 7 * n));
}

/** Money this week on last, in words and neutral ink (her Money tile):
 *  `+12% on last week ($75.10)`, `−8% on last week ($75.10)`. */
export function changeWords(now: number, last: number): string {
  if (last <= 0) return now > 0 ? "nothing spent the week before" : "nothing spent the week before either";
  const pct = ((now - last) / last) * 100;
  const r = Math.round(pct);
  if (r === 0) return `about the same as last week (${money(last)})`;
  return `${r > 0 ? "+" : "−"}${Math.abs(r)}% on last week (${money(last)})`;
}

/** Summed session time: `14 h of work`, `40 min of work`. */
export function hoursWords(h: number): string {
  if (h <= 0) return "no time recorded";
  if (h < 1) return `${Math.max(1, Math.round(h * 60))} min of work`;
  return `${Math.round(h)} h of work`;
}

/** A session's length: `2 h 14 min`, `38 min`, `under a minute`. */
export function duration(minutes: number): string {
  if (!(minutes >= 1)) return "under a minute";
  const m = Math.round(minutes);
  if (m < 60) return `${m} min`;
  return m % 60 ? `${Math.floor(m / 60)} h ${m % 60} min` : `${m / 60} h`;
}

/** A session's start: `Mon 6 Oct 14:02`. */
export function startWords(iso: string, now: Date = new Date()): string {
  const d = parseISO(iso);
  if (!d) return iso;
  const p = (n: number) => String(n).padStart(2, "0");
  return `${DAYS[d.getDay()]} ${dateWords(d, now)} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

/** A share of the week's money: `62%`, `<1%` for a sliver, `0%` for none. */
export function shareWords(share: number): string {
  if (!(share > 0)) return "0%";
  const p = share * 100;
  return p < 1 ? "<1%" : `${Math.round(p)}%`;
}

/** Sorted by money, largest first, then tokens, then key; Not attributed is
 *  always last, whatever it holds. */
export function sortRows<T extends { money: number; tokens: number; key: string; not_attributed: boolean }>(rows: T[]): T[] {
  return [...rows].sort((a, b) =>
    a.not_attributed !== b.not_attributed ? (a.not_attributed ? 1 : -1)
      : b.money - a.money || b.tokens - a.tokens || a.key.localeCompare(b.key));
}

/** Not attributed's hover: why, with how many sessions each. */
export function reasonsWords(reasons: { reason: string; sessions: number }[] | undefined): string {
  if (!reasons?.length) return "nothing unattributed this week";
  return reasons.map((r) => `${r.reason} (${r.sessions} session${r.sessions === 1 ? "" : "s"})`).join("; ");
}

/** The notes under the money total (her States: running and cost unknown). */
export function totalsNotes(t: { running: number; without_cost: number }): string[] {
  const out: string[] = [];
  if (t.running > 0) out.push(`includes ${t.running} running`);
  if (t.without_cost > 0) out.push(`excludes ${t.without_cost} session${t.without_cost === 1 ? "" : "s"} with no cost`);
  return out;
}

const plural = (n: number, one: string) => `${n} ${one}${n === 1 ? "" : "s"}`;
export const sessionsWords = (n: number) => plural(n, "session");

/** The money chart's grid: a round step above the tallest bar, so the grid
 *  is `$0` and one or two lines (`$100`, `$200`). */
export function moneyGrid(max: number): { top: number; lines: number[] } {
  if (!(max > 0)) return { top: 1, lines: [0] };
  const mag = Math.pow(10, Math.floor(Math.log10(max)));
  const step = [1, 2, 5, 10].map((f) => f * mag).find((s) => max / s <= 2) ?? 10 * mag;
  const top = Math.ceil(max / step) * step;
  const lines: number[] = [];
  for (let v = 0; v <= top + step / 2; v += step) lines.push(v);
  return { top, lines };
}

/** A round grid value as its label: `$0`, `$100`, `$2.50`. */
export const gridMoney = (v: number) => (Number.isInteger(v) ? `$${v.toLocaleString("en-US")}` : money(v));

/** Agents' week line (her "From an initiative"), in tokens only (0020). */
export function agentsWeekLine(rows: UsageRow[] | undefined, initiative: string): string | null {
  const r = rows?.find((x) => !x.not_attributed && x.key === initiative);
  return r && r.tokens > 0 ? `This week · ${compact(r.tokens)} tokens` : null;
}

// ---------- 1024×640: what gives way (design system, Widths) ----------

/** Column floors of the table, px, with the gap between columns. Name keeps
 *  about 30 characters; the numbers keep their widest figure. */
export const COL = { name: 260, money: 88, share: 112, tokens: 64, kind: 72, sessions: 72, gap: 12, pad: 24 };

/** Which columns the table shows in `width` px: the four kinds give way
 *  first, then sessions; name, money, share and tokens always stay. */
export function usageColumns(width: number): { kinds: boolean; sessions: boolean } {
  const base = COL.pad + COL.name + COL.money + COL.share + COL.tokens + 3 * COL.gap;
  const withSessions = base + COL.sessions + COL.gap;
  const withKinds = withSessions + 4 * (COL.kind + COL.gap);
  return { kinds: width >= withKinds, sessions: width >= withSessions };
}

/** The Sessions list keeps its model column from this width; below it the
 *  model goes into the row's hover so the session names are not cut. */
export const SESSIONS_MODEL_FROM = 1180;

/** The hover and accessible name of a row whose kind columns gave way. */
export function rowDetail(r: Kinds & { name: string; sessions: number }, cols: { kinds: boolean; sessions: boolean }): string {
  const parts: string[] = [];
  if (!cols.kinds) parts.push(kindsLine(r));
  if (!cols.sessions) parts.push(sessionsWords(r.sessions));
  return parts.join(" · ");
}

// ---------- one initiative (the Agents line's link) ----------

const PAIRLESS = new Set(["fse", "persona", "pair", "session"]);

function reasonOf(cut: Cut, s: UsageSession): string {
  if (cut === "model") return "no model on its messages";
  if (cut === "task" && s.initiative && !s.task && PAIRLESS.has(s.role)) return `a ${s.role} session works on no single card`;
  return s.reason || "not attributed";
}

function keyOf(cut: Cut, s: UsageSession): [string, string] {
  switch (cut) {
    case "initiative": return [s.initiative, s.initiative];
    case "role": return [s.role, s.role];
    case "model": return [s.model, s.model];
    case "task": return s.initiative && s.task ? [`${s.initiative}/${s.task}`, s.task_title || s.task] : ["", ""];
  }
}

/** One initiative's share of the week, from its session rows: the tiles,
 *  the four cuts and the list. Money is the sessions' own, summed. By model,
 *  a session counts under its main model (the rows carry one model each). */
export function forInitiative(sessions: UsageSession[], initiative: string): {
  totals: Omit<UsageTotals, "week" | "start" | "end">; cuts: Record<Cut, UsageRow[]>; sessions: UsageSession[];
} {
  const mine = sessions.filter((s) => s.initiative === initiative);
  const totals = { money: 0, input: 0, output: 0, cache_read: 0, cache_write: 0, tokens: 0, sessions: mine.length, hours: 0, running: 0, without_cost: 0 };
  for (const s of mine) {
    for (const k of KIND_KEYS) totals[k] += s[k] ?? 0;
    totals.tokens += s.tokens;
    if (s.money != null) totals.money += s.money; else totals.without_cost++;
    totals.hours += (s.minutes || 0) / 60;
    if (s.running) totals.running++;
  }
  const cuts = {} as Record<Cut, UsageRow[]>;
  for (const cut of CUTS) {
    const rows = new Map<string, UsageRow>();
    const reasons = new Map<string, number>();
    for (const s of mine) {
      const [key, name] = keyOf(cut, s);
      let r = rows.get(key);
      if (!r) {
        r = { key, name: key ? name : NOT_ATTRIBUTED, money: 0, share: 0, input: 0, output: 0, cache_read: 0, cache_write: 0, tokens: 0, sessions: 0, without_cost: 0, not_attributed: !key };
        if (cut === "task" && key) { r.initiative = s.initiative; r.cards = [s.task]; r.members = []; }
        rows.set(key, r);
      }
      for (const k of KIND_KEYS) r[k] += s[k] ?? 0;
      r.tokens += s.tokens;
      r.sessions++;
      if (s.money != null) r.money += s.money; else r.without_cost++;
      r.members?.push({ id: s.id, name: s.name, role: s.role });
      if (!key) { const why = reasonOf(cut, s); reasons.set(why, (reasons.get(why) ?? 0) + 1); }
    }
    if (!rows.has("")) rows.set("", { key: "", name: NOT_ATTRIBUTED, money: 0, share: 0, input: 0, output: 0, cache_read: 0, cache_write: 0, tokens: 0, sessions: 0, without_cost: 0, not_attributed: true });
    const na = rows.get("")!;
    na.reasons = [...reasons].map(([reason, n]) => ({ reason, sessions: n })).sort((a, b) => b.sessions - a.sessions || a.reason.localeCompare(b.reason));
    for (const r of rows.values()) {
      r.share = totals.money > 0 ? r.money / totals.money : 0;
      r.members?.sort((a, b) => a.name.localeCompare(b.name));
    }
    cuts[cut] = sortRows([...rows.values()]);
  }
  return { totals, cuts, sessions: mine };
}

/** A role as the table names it (her "six of 0098", plus session). */
const ROLE_WORDS: Record<string, string> = { fse: "FSE", persona: "persona seat", pair: "pair session" };
export const roleWords = (role: string) => ROLE_WORDS[role] ?? role;
