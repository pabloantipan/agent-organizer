import type { AgentGroup, AgentsView, BoardView, CellThread, Seat } from "../hooks/useWails";
import { sleepyWord } from "./initiatives";
import type { merge, model, service } from "../../wailsjs/go/models";
import { parseISO } from "./dates";
import { unreadFiles, type UnreadFile } from "./unread";
import { HEALTH, healthState, type HealthState } from "./health";

/** One definition of the human's queue, used by the tab badge, the mailbox
 *  list, the Agents pill and the Slack chat list, so every count agrees.
 *  A thread needs the human when it is escalated or asks them; a card when
 *  its next action is addressed to them; a Solved mark removes either. Deaf
 *  seats are counted apart, and a capped seat is not deaf: it is alive and
 *  posting, only unreachable until restarted. An initiative that is not
 *  active counts nothing (FR-13). */
export const ASKED_RE = /^\s*(pablo|decide)\b/i;

/** A1: the lead is the cell's human, else "pablo", as ASKED_RE assumes.
 *  Identity (stage 6) replaces this. */
export const DEFAULT_LEAD = "pablo";

export const leadOf = (group: AgentGroup | undefined) => (group?.cell?.human || DEFAULT_LEAD).trim().toLowerCase();

/** A decision record asks the lead when its owner is the lead or nobody
 *  (FR-8, 0034); one owned by business or the FSE stays on its Decisions tab. */
const ownedByLead = (d: model.Decision, lead: string) => {
  const o = (d.owner ?? "").trim().toLowerCase();
  return o === "" || o === lead;
};

/** FR-9 (0036): an initiative is active when its `status` is `active`, or
 *  empty, since older initiative.yaml files carry none. Anything else
 *  (paused, archived, …) leaves Home, the rail's groups and Needs me. */
export const isActive = (i: { status?: string } | undefined) => {
  const s = (i?.status ?? "").trim().toLowerCase();
  return s === "" || s === "active";
};

/** The ids of initiatives that are not active. An initiative on two machines
 *  is judged by its local row, as everywhere else. */
export function inactiveIds(view: BoardView | null) {
  const out = new Set<string>();
  const seen = new Set<string>();
  for (const i of [...(view?.board.initiatives ?? [])].sort((a, b) => Number(b.local) - Number(a.local))) {
    if (seen.has(i.id)) continue;
    seen.add(i.id);
    if (!isActive(i)) out.add(i.id);
  }
  return out;
}

/** FR-13 (0042): the one read-only flag. An initiative that is not active
 *  opens read-only: null when it is writable, else its word for the
 *  header's "<word>: read-only": `asleep` for paused, `archived`, or a
 *  status Deltagos has no word for as written (initiatives-view I14). Each
 *  view derives it here once and passes it down; no component reads a
 *  status itself. Judged by the local row, as inactiveIds is. */
export function readOnlyOf(view: BoardView | null, id: string | null | undefined): string | null {
  if (!id) return null;
  const rows = (view?.board.initiatives ?? []).filter((i) => i.id === id);
  const row = rows.find((i) => i.local) ?? rows[0];
  if (!row || isActive(row)) return null;
  return sleepyWord(row.status);
}

/** A relay to a transversal role (`[for <role>] …`, 0079): posted to the
 *  human's seat but the named role's to answer, so never the human's queue. */
const RELAY_RE = /^\s*\[for\s+[^\]]+\]/i;

export const needsMeThread = (t: CellThread) =>
  !RELAY_RE.test(t.subject ?? "") && (t.status === "escalated" || (t.asked_of_me ?? 0) > 0);

export function askedCards(view: BoardView | null, initiativeId: string) {
  return (["now", "blocked", "next"] as const)
    .flatMap((st) => view?.board.columns?.[st] ?? [])
    .filter((c) => c.initiative_id === initiativeId && c.local && ASKED_RE.test(c.next || ""));
}

/** The cells of an initiative that is not active leave every count (FR-13):
 *  its queue is empty, so the Agents pill and Conversations say nothing. */
export function queueOf(group: AgentGroup, view: BoardView | null) {
  if (readOnlyOf(view, group.id)) return { threads: [] as CellThread[], cards: [] as merge.BoardCard[], deaf: 0, capped: 0, total: 0 };
  const resolved = view?.order?.resolved ?? {};
  const threads = (group.threads ?? []).filter((t) => needsMeThread(t) && !resolved[`thread:${t.id}`]);
  const cards = askedCards(view, group.id).filter((c) => !resolved[`card:${group.id}/${c.slug}`]);
  const seats = group.crew ?? [];
  const deaf = seats.filter((s) => s.deaf && !s.capped).length;
  const capped = seats.filter((s) => s.capped).length;
  return { threads, cards, deaf, capped, total: threads.length + cards.length };
}

/** One row of Needs me: a decision waiting on a ruling, a thread asking the
 *  human, a card addressed to them, a seat mail cannot reach, a cell in
 *  definition waiting on its first launch, or an initiative with files the
 *  scan could not read (undated, last; gone when the files read again). `since` is
 *  when it started waiting (null when the source has no date, and those sort
 *  last); `key` is what openNeedsMe and the Solved marks name it by. */
export type NeedsMeRow =
  | { kind: "decision"; key: string; initiative: string; since: Date | null; decision: model.Decision }
  | { kind: "thread"; key: string; initiative: string; since: Date | null; thread: CellThread; asker?: HealthState }
  | { kind: "task"; key: string; initiative: string; since: Date | null; task: service.Task; supervisor: { group: string; id: string } | null; asker?: TaskAsker }
  | { kind: "card"; key: string; initiative: string; since: Date | null; card: merge.BoardCard }
  | { kind: "seat"; key: string; initiative: string; since: Date | null; seat: Seat }
  | { kind: "launch"; key: string; initiative: string; since: null; cell: model.Cell; missing: string | null }
  | { kind: "start"; key: string; initiative: string; since: Date | null; launch: service.InitiativeLaunch }
  | { kind: "unread"; key: string; initiative: string; since: null; path: string; files: UnreadFile[] };

const day = (s: string | undefined) => parseISO(s?.slice(0, 10));

/** Needs me (FR-15): queueOf over every cell plus the decision records
 *  waiting on the lead's ruling (FR-8) and the tasks over their forecast or
 *  stalled (leftovers-28 FR-5), one list, oldest first, of active
 *  initiatives only (FR-9). The top bar's one badge is
 *  its length, so the count always equals the rows. Last, one Launch row per
 *  local cell in definition that is not a draft (discovery-in-a-cell FR-7,
 *  0051): undated, no Solved mark, gone once a seat has run (the cell's
 *  derived state, service.cellState); a draft waits on its accept record,
 *  which is already a decision row. A seat with no persona file makes the
 *  row name it instead (lead-side-fixes FR-3): `missing` is the first such
 *  seat in roster order, and launchVerb turns it into the row's words. */
export function needsMeRows(view: BoardView | null, agents: AgentsView | null, now = new Date()): NeedsMeRow[] {
  const rows: NeedsMeRow[] = [];
  const unread: NeedsMeRow[] = [];
  // An initiative on two machines reports its records twice; the local scan wins.
  const seen = new Set<string>();
  const groups = new Map((agents?.groups ?? []).map((g) => [g.id, g]));
  const folded = inactiveIds(view);
  for (const i of [...(view?.board.initiatives ?? [])].sort((a, b) => Number(b.local) - Number(a.local))) {
    if (seen.has(i.id)) continue;
    seen.add(i.id);
    if (folded.has(i.id)) continue;
    const lead = leadOf(groups.get(i.id));
    for (const d of i.decisions ?? []) {
      if (d.status === "proposed" && ownedByLead(d, lead)) rows.push({ kind: "decision", key: `decision:${i.id}/${d.number}`, initiative: i.id, since: day(d.raised), decision: d });
    }
    // Files the scan could not read: whatever ask they hold is missing from
    // every other row, so the initiative gets one row that says so.
    const files = unreadFiles(i.problems);
    if (files.length > 0) unread.push({ kind: "unread", key: `unread:${i.id}`, initiative: i.id, since: null, path: i.path, files });
  }
  for (const g of agents?.groups ?? []) {
    if (!g.cell || folded.has(g.id)) continue;
    const q = queueOf(g, view);
    for (const t of q.threads) rows.push({ kind: "thread", key: `thread:${t.id}`, initiative: g.id, since: new Date(now.getTime() - (t.age_seconds ?? 0) * 1000), thread: t, asker: askerHealth(t, g.crew) });
    // A task over its forecast or stalled (FR-5): one row per task, never per
    // card, dated by its ruling; a task that is on has none.
    for (const t of g.tasks ?? []) {
      if (t.state === "over" || t.state === "stalled") rows.push({ kind: "task", key: `task:${g.id}/${t.number}`, initiative: g.id, since: t.started ? new Date(t.started) : null, task: t, supervisor: supervisorAgent(t, g, agents), asker: taskAsker(t, g.crew) });
    }
    for (const c of q.cards) rows.push({ kind: "card", key: `card:${g.id}/${c.slug}`, initiative: g.id, since: day(c.updated), card: c });
    for (const s of g.crew ?? []) {
      if (s.deaf || s.capped) rows.push({ kind: "seat", key: `seat:${g.id}/${s.name}`, initiative: g.id, since: null, seat: s });
    }
  }
  // A start with a seat that did not start, not yet seen on Agents (FR-7):
  // one row per initiative, gone once the list is shown (SeenLaunch) or the
  // seat is retried (the service's `seen` and `failed`). Dated with the last
  // failure (`failed_at`, leftovers-30 FR-5), so it sorts among the dated rows.
  for (const l of agents?.launches ?? []) {
    if (l.failed > 0 && !l.seen && !folded.has(l.initiative)) rows.push({ kind: "start", key: `start:${l.initiative}`, initiative: l.initiative, since: lastFailure(l, now), launch: l });
  }
  const at = (r: NeedsMeRow) => r.since?.getTime() ?? Number.MAX_SAFE_INTEGER;
  rows.sort((a, b) => at(a) - at(b));
  for (const g of agents?.groups ?? []) {
    if (g.cell?.state === "in_definition" && !g.cell.draft && !folded.has(g.id)) {
      const missing = (g.crew ?? []).find((s) => s.no_persona)?.name ?? null;
      rows.push({ kind: "launch", key: `launch:${g.id}`, initiative: g.id, since: null, cell: g.cell, missing });
    }
  }
  return rows.concat(unread);
}

/** When a failed start's last seat failed: the latest `failed_at` of its
 *  failed seats (leftovers-30 FR-5), else that seat's last try's start for an
 *  entry without one (leftovers-29 FR-5); `now` when no failed seat carries
 *  either, so the row is never undated. */
function lastFailure(l: service.InitiativeLaunch, now: Date): Date {
  const times = (l.seats ?? []).filter((s) => s.state === "failed").map((s) => new Date(s.failed_at || s.started_at || "").getTime()).filter((n) => !Number.isNaN(n));
  return times.length > 0 ? new Date(Math.max(...times)) : now;
}

/** A seat's health as an asker (FR-6; leftovers-29 FR-7): a capped seat
 *  whose watcher is alive is capped, its mail waiting for its next prompt;
 *  a capped one whose watcher is not alive reads by its watcher, since that
 *  is why the answer would not wake it. */
function askerState(s: Seat): HealthState | undefined {
  if (s.capped && s.watcher !== "alive") return healthState({ watcher: s.watcher, deaf: s.deaf }) ?? "capped";
  return healthState(s);
}

/** The health of the seat a thread asks the human for, from the cell's
 *  roster (FR-6): undefined when the thread asks nothing, names no seat, or
 *  the seat is not on the roster. */
function askerHealth(t: CellThread, crew: Seat[] | undefined): HealthState | undefined {
  if (!t.asked_by || (t.asked_of_me ?? 0) === 0) return undefined;
  const s = (crew ?? []).find((c) => c.name === t.asked_by);
  return s ? askerState(s) : undefined;
}

/** The first of a task's seats, in its order (the cards' seats, then the
 *  supervisors), that is on the roster and not alive (task-rows §3). */
export type TaskAsker = { seat: string; state: HealthState };
function taskAsker(t: service.Task, crew: Seat[] | undefined): TaskAsker | undefined {
  for (const name of t.seats ?? []) {
    const s = (crew ?? []).find((c) => c.name === name);
    const state = s && askerState(s);
    if (state && state !== "alive") return { seat: name, state };
  }
  return undefined;
}

/** The live session of a task's supervisor (task-rows §4), as the id
 *  AgentsView lands on (`<session>#<pid>`): the session probe names
 *  `<family>-probe-<supervisor>`, the family being the cell's project or
 *  the initiative's id, running or working, in any group. Null when the task
 *  has no supervisor or its session is not live. */
function supervisorAgent(t: service.Task, g: AgentGroup, view: AgentsView | null): { group: string; id: string } | null {
  const sup = t.supervisor;
  if (!sup) return null;
  // probe's family, as service.probeFamily sanitizes it.
  const family = (g.cell?.project || g.id).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  const names = new Set([`${family}-probe-${sup}`, sup]);
  const live = (a: { session: string; pid: number; state: string }) => names.has(a.session) && (a.state === "running" || a.state === "working") && a.pid > 0;
  const where: [string, { session: string; pid: number; state: string }[]][] = [
    ...(view?.groups ?? []).map((x): [string, { session: string; pid: number; state: string }[]] => [x.id, [...(x.agents ?? []), ...(x.crew ?? []).flatMap((s) => (s.agent ? [s.agent] : []))]]),
    ["", view?.unassigned ?? []],
  ];
  for (const [group, list] of where) {
    const a = list.find(live);
    if (a) return { group, id: `${a.session}#${a.pid}` };
  }
  return null;
}

/** A thread row's context line (FR-6): who asks, or that it was escalated,
 *  and the messages; when the asking seat's watcher is not alive, that the
 *  seat is not picking up, in the health table's words, since the answer
 *  would not wake it. */
export function threadContext(row: { thread: CellThread; asker?: HealthState }): string {
  const t = row.thread;
  const who = t.status === "escalated" ? "escalated to you" : `${t.asked_by || "a seat"} asks you`;
  const head = `${who} · ${t.messages} message${t.messages === 1 ? "" : "s"}`;
  if (!row.asker || row.asker === "alive" || !t.asked_by) return head;
  // A capped asker with a live watcher (leftovers-29 FR-7, task-rows §5):
  // alive, its mail waits for its next prompt; never "not picking up".
  if (row.asker === "capped") return `${head} · ${t.asked_by} ${HEALTH.capped.blocker}`;
  const h = HEALTH[row.asker];
  return `${head} · ${t.asked_by} is not picking up (${h.label}): ${h.why}`;
}

/** Minutes as the rows say them: "52 m", "2 h 10 m", "3 h". */
export function spanWords(min: number): string {
  const m = Math.max(0, Math.floor(min));
  const h = Math.floor(m / 60);
  if (h === 0) return `${m} m`;
  return m % 60 === 0 ? `${h} h` : `${h} h ${m % 60} m`;
}

/** The silence that makes a task stalled (FR-4): 45 min with no post while
 *  a card of it is in now. */
const QUIET_STALL = 45;

/** A forecast band in the rows' units: "1-2m" is "1-2 m", "1.5-3h" is
 *  "1.5-3 h" (task-rows §2, the hover). */
export function forecastWords(f: string): string {
  const m = /^\s*([\d.]+\s*-\s*[\d.]+)\s*(m|h)\s*$/i.exec(f ?? "");
  return m ? `${m[1].replace(/\s+/g, "")} ${m[2].toLowerCase()}` : f ?? "";
}

/** How many times its forecast's top a task has run, rounded down; null
 *  under 2×, where the row shows no multiple (task-rows §2). */
export function forecastMultiple(t: Pick<service.Task, "elapsed_minutes" | "forecast_top">): number | null {
  if (!(t.forecast_top > 0)) return null;
  const n = Math.floor(t.elapsed_minutes / t.forecast_top);
  return n >= 2 ? n : null;
}

/** A task row's fact, what the lozenge's word rests on, said first so the
 *  ellipsis cuts the title (task-rows §3): stalled by the silence when that
 *  is why (it names the fact to chase), else the time and, from 2×, the
 *  multiple: `10 m, 5× its forecast`; under 2×, `past its forecast`. */
export function taskFact(t: Pick<service.Task, "forecast_top" | "elapsed_minutes" | "quiet_minutes" | "cards" | "state">): string {
  if (t.state === "stalled" && t.quiet_minutes != null && t.quiet_minutes >= QUIET_STALL && (t.cards ?? []).some((c) => c.status === "now")) {
    return `no post for ${spanWords(t.quiet_minutes)}`;
  }
  const n = forecastMultiple(t);
  return `${spanWords(t.elapsed_minutes)}, ${n ? `${n}× its forecast` : "past its forecast"}`;
}

/** A task row's lozenge (task-rows §1): stalled is late, not stuck, so
 *  amber; over is the tone. Red stays blocked's and escalated's. */
export const taskTone = (state: string) => (state === "stalled" ? "warning" : "tone");

/** A task row's whole line, as its hover and accessible name say it:
 *  `stalled · 10 m, 5× its forecast · init-a 0011 · <title>`. */
export function taskLine(initiative: string, t: Pick<service.Task, "number" | "title" | "forecast_top" | "elapsed_minutes" | "quiet_minutes" | "cards" | "state">): string {
  return `${t.state} · ${taskFact(t)} · ${initiative} ${t.number} · ${t.title}`;
}

/** A task row's second line (FR-5): the asker's health first when a seat of
 *  the task is not alive (task-rows §3, `hestia not picking up`), then the
 *  supervisor's last post when there is one (`sup64: <subject>: <first
 *  line>`), else the record and its cards. */
export function taskContext(t: Pick<service.Task, "number" | "cards" | "last_post">, asker?: TaskAsker): string {
  const p = t.last_post;
  const cards = (t.cards ?? []).map((c) => `${c.slug} ${c.status}`).join(", ");
  const rest = p ? `${p.from}: ${p.subject}: ${p.line}` : `record ${t.number}${cards ? ` · ${cards}` : ""} · no post from its supervisor`;
  return asker ? `${asker.seat} ${HEALTH[asker.state].blocker} · ${rest}` : rest;
}

/** The card a task's Open lands on (task-rows §4): its first card in now,
 *  else its first open one. */
export function taskCard(t: Pick<service.Task, "cards">): string | null {
  const open = (t.cards ?? []).filter((c) => c.status !== "done");
  return (open.find((c) => c.status === "now") ?? open[0])?.slug ?? null;
}

/** The board card of an initiative by slug, the local one first. */
export function boardCard(view: BoardView | null, initiative: string, slug: string): merge.BoardCard | null {
  const all = (["now", "blocked", "next"] as const).flatMap((st) => view?.board.columns?.[st] ?? []).filter((c) => c.initiative_id === initiative && c.slug === slug);
  return all.find((c) => c.local) ?? all[0] ?? null;
}

/** A failed start's Needs me subject (FR-7): `Crew of <id>: n seat(s) didn't
 *  start`; a New agent start names its agents. */
export function failedStartLine(l: Pick<service.InitiativeLaunch, "initiative" | "kind" | "failed">): string {
  const n = l.failed;
  return l.kind === "crew"
    ? `Crew of ${l.initiative}: ${n} seat${n === 1 ? "" : "s"} didn't start`
    : `${l.initiative}: ${n} agent${n === 1 ? "" : "s"} didn't start`;
}

/** The verb and blocker of a cell-in-definition row (FR-3): a cell that
 *  cannot launch because a seat has no persona file says which, and its verb
 *  is Open, since the fix is on Agents and not a launch; else Launch. */
export function launchVerb(row: { missing: string | null }): { verb: "Open" | "Launch"; blocker: string | null } {
  return row.missing ? { verb: "Open", blocker: personaMissing([row.missing]) } : { verb: "Launch", blocker: null };
}

/** The seats of a cell with no persona file under agents/, in roster order. */
export const missingPersonas = (crew: Pick<Seat, "name" | "no_persona">[] | undefined) => (crew ?? []).filter((s) => s.no_persona).map((s) => s.name);

/** What a missing persona file blocks, and who writes it (ui-leftovers FR-9;
 *  design system, Disabled actions: what is missing and who fixes it). It
 *  replaces "waits on its first launch" wherever a cell in definition says
 *  why it waits. Empty when no file is missing. */
export function personaMissing(names: string[]): string {
  if (names.length === 0) return "";
  const who = names.length === 1 ? names[0] : `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
  const [has, file, it] = names.length === 1 ? ["has", "file", "it"] : ["have", "files", "them"];
  return `${who} ${has} no persona ${file}; the drafting session writes ${it}, or write ${it} by the persona-agents skill`;
}

/** Needs me's first five (leftovers-11 FR-1; transversal-roles Amendment 1,
 *  A1): at compact and regular the oldest five and how many follow, so Roles
 *  stays in view, unless all are asked for; wide, where Needs me has its own
 *  region, shows every row. The rows are needsMeRows', in its order: this
 *  changes the layout, never what counts (0034). */
export const NEEDS_ME_FIRST = 5;
export function needsMeShown<T>(rows: T[], showAll: boolean, wide: boolean): { shown: T[]; hidden: number } {
  if (showAll || wide || rows.length <= NEEDS_ME_FIRST) return { shown: rows, hidden: 0 };
  return { shown: rows.slice(0, NEEDS_ME_FIRST), hidden: rows.length - NEEDS_ME_FIRST };
}

/** Whether the row named by key sits behind "Show the other N" (leftovers-12
 *  FR-5): a landing on it opens the rest first. False for no key, a key not
 *  in the rows, or one of the first five. */
export function pastFirst(rows: { key: string }[], key: string | null | undefined): boolean {
  return !!key && rows.findIndex((r) => r.key === key) >= NEEDS_ME_FIRST;
}
