import type { AgentGroup, AgentsView, BoardView, CellThread, Seat } from "../hooks/useWails";
import type { merge, model } from "../../wailsjs/go/models";
import { parseISO } from "./dates";
import { unreadFiles, type UnreadFile } from "./unread";

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
 *  opens read-only: null when it is writable, else its status word
 *  ("archived", "paused", …) for the header's "<status>: read-only". Each
 *  view derives it here once and passes it down; no component reads a
 *  status itself. Judged by the local row, as inactiveIds is. */
export function readOnlyOf(view: BoardView | null, id: string | null | undefined): string | null {
  if (!id) return null;
  const rows = (view?.board.initiatives ?? []).filter((i) => i.id === id);
  const row = rows.find((i) => i.local) ?? rows[0];
  if (!row || isActive(row)) return null;
  return (row.status ?? "").trim().toLowerCase();
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
  | { kind: "thread"; key: string; initiative: string; since: Date | null; thread: CellThread }
  | { kind: "card"; key: string; initiative: string; since: Date | null; card: merge.BoardCard }
  | { kind: "seat"; key: string; initiative: string; since: Date | null; seat: Seat }
  | { kind: "launch"; key: string; initiative: string; since: null; cell: model.Cell; missing: string | null }
  | { kind: "unread"; key: string; initiative: string; since: null; path: string; files: UnreadFile[] };

const day = (s: string | undefined) => parseISO(s?.slice(0, 10));

/** Needs me (FR-15): queueOf over every cell plus the decision records
 *  waiting on the lead's ruling (FR-8), one list, oldest first, of active
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
    for (const t of q.threads) rows.push({ kind: "thread", key: `thread:${t.id}`, initiative: g.id, since: new Date(now.getTime() - (t.age_seconds ?? 0) * 1000), thread: t });
    for (const c of q.cards) rows.push({ kind: "card", key: `card:${g.id}/${c.slug}`, initiative: g.id, since: day(c.updated), card: c });
    for (const s of g.crew ?? []) {
      if (s.deaf || s.capped) rows.push({ kind: "seat", key: `seat:${g.id}/${s.name}`, initiative: g.id, since: null, seat: s });
    }
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
