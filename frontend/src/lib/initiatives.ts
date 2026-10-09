/** The Initiatives view's words (docs/ux/specs/initiatives-view.md, Aglaea's
 *  design; docs/specs/initiatives-view.md FR-5): the state of each
 *  initiative, the head's count, the sections and their order, the card's
 *  lines, Sleep's confirm, Wake's refusal at the limit and what is true after
 *  a failure. Pure, so every row of her States table is tested here; the
 *  view only draws what these return. */

import { gb } from "./memory";

/** awake (`active`, or no status), asleep (`paused`), or archived (anything
 *  else: the factory refuses to sleep or wake it, so it is never asleep). */
export type Sleepy = "awake" | "asleep" | "archived";

export function sleepyOf(status: string | undefined): Sleepy {
  const s = (status ?? "").trim().toLowerCase();
  if (s === "" || s === "active") return "awake";
  if (s === "paused") return "asleep";
  return "archived";
}

/** The word the card and the rail show: `awake`, `asleep`, `archived`, or a
 *  status the file writes that Deltagos has no word for, as written. */
export function sleepyWord(status: string | undefined): string {
  const s = (status ?? "").trim().toLowerCase();
  const st = sleepyOf(s);
  return st === "archived" && s !== "archived" ? s : st;
}

/** The factory's limit when it answered, else the four of its rule. */
export const DEFAULT_LIMIT = 4;

const NUMBER_WORDS = ["none", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];
/** A small count as a word (`four`), a figure past ten. */
export const numberWord = (n: number) => NUMBER_WORDS[n] ?? String(n);
const capital = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** The head's count (her §1): neutral under the limit and at it, magenta
 *  over it, with its hover. `factoryAwake` is the factory's own count when
 *  it differs (an initiative it does not see): the hover says so. */
export function countWords(awake: number, limit: number, factoryAwake: number | null = null, blind: string[] = []): { text: string; over: boolean; title: string } {
  const over = awake > limit;
  const text = `${awake} of ${limit} awake${awake === limit ? " · the limit" : over ? " · over the limit" : ""}`;
  const hover: string[] = [];
  if (over) hover.push("one was woken past the limit outside Deltagos; put one to sleep");
  if (factoryAwake !== null && factoryAwake !== awake) {
    hover.push(`the factory counts ${factoryAwake}${blind.length ? `; it does not see ${listWords(blind)}` : ""}`);
  }
  return { text, over, title: hover.join("\n") };
}

/** `a`, `a and b`, `a, b and c`. */
export function listWords(names: string[]): string {
  if (names.length <= 1) return names.join("");
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}

/** Nouns that agree: `1 session`, `4 sessions`. */
export const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

/** The card's sessions line (her §3): awake `4 sessions live · 1 frozen ·
 *  1 working`, the frozen and working parts only when there are any, `no
 *  sessions live` with none; asleep `3 sessions frozen` or `no sessions
 *  frozen`. */
export function sessionsLine(state: Sleepy, live: number, frozen: number, working: number): string {
  if (state === "asleep") {
    const base = frozen > 0 ? `${plural(frozen, "session")} frozen` : "no sessions frozen";
    return live > 0 ? `${base} · ${live} live` : base;
  }
  const parts = [live > 0 ? `${plural(live, "session")} live` : "no sessions live"];
  if (frozen > 0) parts.push(`${frozen} frozen`);
  if (working > 0) parts.push(`${working} working`);
  return parts.join(" · ");
}

/** The sessions line while Sleep or Wake runs (her §6). */
export function progressLine(action: "sleep" | "wake", sessions: number): string {
  const verb = action === "sleep" ? "freezing" : "thawing";
  return sessions > 0 ? `${verb} ${plural(sessions, "session")}…` : action === "sleep" ? "putting it to sleep…" : "waking it…";
}

/** The memory reading as the feed carries it, loosely typed for tests. */
export type MemoryFeed = {
  memory?: { pressure: string; by_initiative?: { initiative: string; bytes: number; unassigned?: boolean }[] | null } | null;
  memory_reason?: string;
} | null | undefined;

/** The card's memory line and its hover (her §3 and States): `Memory 9.8
 *  GB`, `Memory 11.2 GB · the most` on the awake card holding the most at
 *  high or critical pressure, `Memory —` before the first reading or when it
 *  failed, `Memory: none running` when nothing of it runs. `top` is the
 *  hover's biggest sessions, already worded. */
export function memoryLine(feed: MemoryFeed, id: string, most: boolean, top: string[] = []): { text: string; title: string } {
  if (!feed?.memory) {
    return { text: "Memory —", title: feed?.memory_reason ? "memory could not be read" : "reading memory…" };
  }
  const bytes = (feed.memory.by_initiative ?? []).find((m) => !m.unassigned && m.initiative === id)?.bytes ?? 0;
  if (bytes <= 0) return { text: "Memory: none running", title: "no session of it runs" };
  return { text: `Memory ${gb(bytes)} GB${most ? " · the most" : ""}`, title: top.length ? `biggest: ${top.join(", ")}` : "" };
}

/** At high or critical pressure, the awake initiative holding the most
 *  memory (her §3), so the lead can pick one to sleep; null otherwise. */
export function mostMemory(feed: MemoryFeed, awakeIds: string[]): string | null {
  const p = feed?.memory?.pressure;
  if (p !== "high" && p !== "critical") return null;
  let best: { id: string; bytes: number } | null = null;
  for (const m of feed?.memory?.by_initiative ?? []) {
    if (m.unassigned || !awakeIds.includes(m.initiative) || m.bytes <= 0) continue;
    if (!best || m.bytes > best.bytes) best = { id: m.initiative, bytes: m.bytes };
  }
  return best?.id ?? null;
}

/** A session as the memory hover names it: `fse 1.4 GB`. */
export const sessionBytes = (name: string, bytes: number) => `${name} ${gb(bytes)} GB`;

/** The card's next line (her §3): `Next: due 14 Oct`, `Next: target 31
 *  Oct`, `Next: milestone 3 Nov`; `Next: no date`. `next.what` is Home's
 *  (`due · <slug>`), its first word the kind. */
export function nextLine(next: { date: string; what: string } | null, words: (d: string) => string): { text: string; title: string; none: boolean } {
  if (!next) return { text: "Next: no date", title: "no card due, milestone or target ahead", none: true };
  const kind = next.what.split(" · ")[0] || next.what;
  return { text: `Next: ${kind} ${words(next.date)}`, title: `${words(next.date)} · ${next.what}`, none: false };
}

/** `asleep since 2 Oct`, when the factory's comment says so; null else. */
export const sinceLine = (asleepSince: string | undefined, words: (d: string) => string) =>
  asleepSince ? `asleep since ${words(asleepSince)}` : null;

/** What waits on the lead for one initiative: its Needs me rows by kind. */
export type Waiting = { decision: number; thread: number; card: number; other: number };

export function waitingOf(rows: { kind: string; initiative: string }[], id: string): Waiting {
  const w: Waiting = { decision: 0, thread: 0, card: 0, other: 0 };
  for (const r of rows) {
    if (r.initiative !== id) continue;
    if (r.kind === "decision" || r.kind === "thread" || r.kind === "card") w[r.kind]++;
    else w.other++;
  }
  return w;
}

const waitingTotal = (w: Waiting) => w.decision + w.thread + w.card + w.other;

/** Sleep's confirm (her §4): the question, then only the lines that are
 *  true; an empty `lines` means nothing is live and nothing waits, so Sleep
 *  runs at once. `working` names the sessions working now; `lastAwake` adds
 *  Home's line. */
export function confirmLines(id: string, live: number, working: string[], waiting: Waiting, lastAwake: boolean): { question: string; lines: string[]; commit: string } {
  const lines: string[] = [];
  if (live > 0) lines.push(`${plural(live, "session")} ${live === 1 ? "freezes: its conversation is kept" : "freeze: their conversations are kept"} and mail waits.`);
  if (working.length > 0) lines.push(`${working.length} ${working.length === 1 ? "is" : "are"} working now: ${listWords(working)}.`);
  if (waitingTotal(waiting) > 0) {
    const parts = [
      waiting.decision > 0 && plural(waiting.decision, "decision"),
      waiting.thread > 0 && plural(waiting.thread, "thread"),
      waiting.card > 0 && plural(waiting.card, "card"),
      waiting.other > 0 && `${waiting.other} other ${waiting.other === 1 ? "row" : "rows"}`,
    ].filter(Boolean) as string[];
    lines.push(`${listWords(parts)} waiting on you leave Needs me until it wakes.`);
  }
  if (lines.length > 0 && lastAwake) lines.push("Home will be empty until one wakes.");
  return { question: `Sleep ${id}?`, lines, commit: `Sleep ${id}` };
}

/** Wake refused at the limit (her §5): the Asleep head's line and each
 *  refused Wake's accessible name. */
export function limitLine(awakeIds: string[]): string {
  const p = limitParts(awakeIds.length);
  return `${p.lead}${awakeIds.join(", ")}${p.tail}`;
}
/** The same line in its parts, for the head, where each name is a link to
 *  that card's Sleep. */
export const limitParts = (n: number) => ({ lead: `${capital(numberWord(n))} are awake: `, tail: ". Put one to sleep to wake another." });
export const refusedWakeName = (id: string, awake: number) => `Wake ${id}: ${numberWord(awake)} are awake`;

/** A press while another Sleep or Wake runs (her §6). */
export const waitLine = (running: { id: string; action: "sleep" | "wake" }) =>
  `Wait for ${running.id} to finish ${running.action === "sleep" ? "sleeping" : "waking"}.`;

/** The live region's words when one is done (her §6). */
export const doneLine = (id: string, action: "sleep" | "wake") => `${id} is ${action === "sleep" ? "asleep" : "awake"}`;

/** The first non-empty line of what the factory said. */
export const firstLine = (out: string) => (out ?? "").split("\n").map((l) => l.trim()).find(Boolean) ?? "";

/** The factory's refusal at its own limit, whatever Deltagos counted: exit
 *  1 and its `(limit N)` words (sleep.sh's refusal). */
export const isLimitRefusal = (r: { exit_code: number; output: string }) => r.exit_code === 1 && /\(limit \d+\)/.test(r.output ?? "");

/** What is true after a failed Sleep or Wake, from the rescan (her States,
 *  factory failing): `Nothing changed.` when the status is still what it
 *  was; else the new state and the sessions that still run against it. */
export function afterLine(id: string, action: "sleep" | "wake", status: string, running: string[]): string {
  const st = sleepyOf(status);
  const target: Sleepy = action === "sleep" ? "asleep" : "awake";
  if (st !== target) return "Nothing changed.";
  if (action === "sleep" && running.length > 0) {
    return `${id} is asleep, but ${running.length} ${running.length === 1 ? "session still runs" : "sessions still run"}: ${listWords(running)}.`;
  }
  return `${id} is ${target}.`;
}

/** The factory as the view reads it: found, answering, its limit and count. */
export type FactoryFacts = { found: boolean; ok: boolean; reason?: string; limit: number; awake: number } | null | undefined;

/** The head's line when Sleep and Wake cannot run at all (her States):
 *  missing, or failing to answer `factory awake`; null when it answers. */
export function factoryLine(f: FactoryFacts): string | null {
  if (!f) return null;
  if (!f.found) return "Sleep and Wake need the factory command, which is not on this Mac.";
  if (!f.ok) return `Sleep and Wake need the factory, which did not answer: ${f.reason || "no reason given"}.`;
  return null;
}

/** One initiative as the view orders it. */
export type Item = { id: string; state: Sleepy; local: boolean };

/** Awake, asleep, then archived, each in the rail's order (the board's
 *  priority, which `items` already follows). */
export function sectionsOf<T extends Item>(items: T[]): { awake: T[]; asleep: T[]; archived: T[] } {
  return {
    awake: items.filter((i) => i.state === "awake"),
    asleep: items.filter((i) => i.state === "asleep"),
    archived: items.filter((i) => i.state === "archived"),
  };
}

/** The Archived section open or closed, per viewer (her §2), closed by
 *  default; storage can throw or be empty, and then it is closed. */
export const ARCHIVED_KEY = "initiatives.archived.open";
export function storedArchivedOpen(): boolean {
  try { return localStorage.getItem(ARCHIVED_KEY) === "1"; } catch { return false; }
}
export function storeArchivedOpen(open: boolean): boolean {
  try { localStorage.setItem(ARCHIVED_KEY, open ? "1" : "0"); } catch { /* per-viewer convenience */ }
  return open;
}

/** One Agents row's Memory cell (her Agents section): its figure, or `—`
 *  with why. `feed` is the agents payload's reading. */
export function agentMemory(a: { pid: number; state: string; mem_bytes?: number }, feed: MemoryFeed): { text: string; title: string } {
  if (a.pid <= 0 || a.state === "exited" || a.state === "off") return { text: "—", title: "not running" };
  if (!feed?.memory) return { text: "—", title: feed?.memory_reason ? "memory could not be read" : "reading memory…" };
  if (!a.mem_bytes || a.mem_bytes <= 0) return { text: "—", title: "reading memory…" };
  return { text: `${gb(a.mem_bytes)} GB`, title: "this process tree's footprint" };
}

/** A group's total in its head (her Agents section): the same number as its
 *  card, `Memory 9.8 GB`; null when nothing of it runs or there is no
 *  reading. `id` "" is the sessions outside every initiative. */
export function groupMemory(feed: MemoryFeed, id: string): string | null {
  if (!feed?.memory) return null;
  const m = (feed.memory.by_initiative ?? []).find((x) => (id === "" ? !!x.unassigned : !x.unassigned && x.initiative === id));
  return m && m.bytes > 0 ? `Memory ${gb(m.bytes)} GB` : null;
}
