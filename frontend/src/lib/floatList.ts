// The floating icon's list panel (docs/ux/specs/floating-icon.md §3): its
// rows, groups, search and Home count, apart from how FloatList draws them.

import type { AgentsView, BoardView, Group } from "../hooks/useWails";
import type { merge, service } from "../../wailsjs/go/models";
import { signalOwners, waitingDecisions } from "./decisions";
import { inactiveIds, leadOf, needsMeRows } from "./queue";
import { FOLD } from "./width";

export type SignalKind = "waiting" | "blocked" | "now" | "live" | "cell" | "problems";

/** One signal of a row. `fold` is how soon it folds into "+N" (the design
 *  system's order, `FOLD` in width.ts); null never folds (blocked). Waiting
 *  folds last of all and only when blocked and it cannot both fit, and its
 *  `floor` ("2 waiting") is what it keeps when its names are cut. */
export type Signal = { kind: SignalKind; text: string; floor?: string; fold: number | null };

export type FloatRow = { id: string; goal: string; rank: number | null; signals: Signal[] };
export type FloatSection = { name: string; rows: FloatRow[] };
export type FloatList = { sections: FloatSection[]; inactive: FloatRow[] };

const uniq = <T,>(xs: T[]) => Array.from(new Set(xs));

/** A row's signals, in the order Home draws them: waiting, blocked, now,
 *  the running waves, live, the cell in definition, problems. */
export function signalsOf(i: merge.BoardInitiative, rows: merge.BoardInitiative[], cards: merge.BoardCard[], group: service.AgentGroup | undefined): Signal[] {
  const out: Signal[] = [];
  const waiting = waitingDecisions(i);
  if (waiting > 0) {
    const floor = `${waiting} waiting`;
    out.push({ kind: "waiting", text: `${floor} · ${signalOwners(i, leadOf(group)).join(", ")}`, floor, fold: FOLD.waiting });
  }
  const blocked = cards.filter((c) => c.status === "blocked").length;
  if (blocked > 0) out.push({ kind: "blocked", text: `${blocked} blocked`, fold: null });
  const now = cards.filter((c) => c.status === "now").length;
  if (now > 0) out.push({ kind: "now", text: `${now} now`, fold: FOLD.now });
  for (const w of group?.waves ?? []) {
    const n = w.building?.length ?? 0;
    if (n > 0) out.push({ kind: "live", text: `wave ${w.n} · ${n} building`, fold: FOLD.live });
  }
  const live = rows.reduce((a, r) => a + (r.live ?? 0), 0);
  const working = rows.reduce((a, r) => a + (r.working ?? 0), 0);
  if (live > 0) out.push({ kind: "live", text: working > 0 ? `${working} working` : `${live} live`, fold: FOLD.live });
  if (group?.cell?.state === "in_definition") out.push({ kind: "cell", text: "cell in definition", fold: FOLD.cell });
  const problems = i.problems?.length ?? 0;
  if (problems > 0) out.push({ kind: "problems", text: `${problems} problem${problems === 1 ? "" : "s"}`, fold: FOLD.problems });
  return out;
}

/** The rows in the rail's order and groups (Rail.tsx): the stored groups,
 *  then the ungrouped rest, with ranks over active initiatives only; the
 *  initiatives that are not active last, unranked. */
export function floatList(view: BoardView | null, agents: AgentsView | null): FloatList {
  const all = view?.board.initiatives ?? [];
  const ids = uniq(all.map((i) => i.id));
  const cols = view?.board.columns ?? {};
  const groups = new Map((agents?.groups ?? []).map((g) => [g.id, g]));
  const folded = inactiveIds(view);
  const active = ids.filter((id) => !folded.has(id));
  const rank = new Map(active.map((id, k) => [id, k + 1]));
  const row = (id: string): FloatRow => {
    const rows = all.filter((i) => i.id === id);
    const i = rows.find((r) => r.local) ?? rows[0];
    const cards = (["now", "blocked", "next"] as const).flatMap((st) => (cols[st] ?? []).filter((c) => c.initiative_id === id));
    return { id, goal: i.goal ?? "", rank: rank.get(id) ?? null, signals: signalsOf(i, rows, cards, groups.get(id)) };
  };
  const stored: Group[] = view?.order?.groups ?? [];
  let sections: FloatSection[];
  if (stored.length === 0) {
    sections = active.length ? [{ name: "", rows: active.map(row) }] : [];
  } else {
    const known = new Set(active);
    const placed = new Set(stored.flatMap((g) => g.initiatives ?? []));
    sections = stored.map((g) => ({ name: g.name, rows: (g.initiatives ?? []).filter((id) => known.has(id)).map(row) }));
    const rest = active.filter((id) => !placed.has(id));
    if (rest.length) sections.push({ name: "ungrouped", rows: rest.map(row) });
    sections = sections.filter((s) => s.rows.length > 0);
  }
  return { sections, inactive: ids.filter((id) => folded.has(id)).map(row) };
}

/** Every word of the query, in any order, in the id or the goal. */
export function matches(r: FloatRow, query: string): boolean {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  const hay = `${r.id} ${r.goal}`.toLowerCase();
  return words.every((w) => hay.includes(w));
}

/** The list as the query leaves it: groups with no match drop out, so a
 *  heading shows only over groups that have matches. */
export function filterList(list: FloatList, query: string): FloatList {
  if (!query.trim()) return list;
  return {
    sections: list.sections.map((s) => ({ ...s, rows: s.rows.filter((r) => matches(r, query)) })).filter((s) => s.rows.length > 0),
    inactive: list.inactive.filter((r) => matches(r, query)),
  };
}

/** What the keyboard moves through, top to bottom: Home, unless a query
 *  hides it, then every row shown. The not-active rows count only when
 *  their group is open. */
export function focusOrder(list: FloatList, query: string, inactiveOpen: boolean): string[] {
  const out = query.trim() ? [] : [HOME];
  for (const s of list.sections) out.push(...s.rows.map((r) => r.id));
  if (inactiveOpen || query.trim()) out.push(...list.inactive.map((r) => r.id));
  return out;
}

/** The key of the Home row in focusOrder; no initiative id has a space. */
export const HOME = "home row";

/** The Home row's count: the rows of Needs me, the top bar's badge. */
export const homeCount = (view: BoardView | null, agents: AgentsView | null) => needsMeRows(view, agents).length;

export const homeLabel = (n: number) => (n > 0 ? `Home · ${n} need${n === 1 ? "s" : ""} you` : "Home");

/** A row's signals at a room of `room` characters (the panel is a fixed 360
 *  px, so characters are the measure): the foldable ones leave, the soonest
 *  first, until what stays fits beside "+N". Blocked and waiting never fold;
 *  waiting is cut to its floor when it must be. `gap` is what sits between
 *  two lozenges and `more` the "+N", both in characters. */
export function foldSignals(signals: Signal[], room: number, { gap: GAP = 1, more: MORE = 3 } = {}): { shown: Signal[]; rest: Signal[]; cut: boolean } {
  const keep = signals.slice();
  const width = (xs: Signal[], cut: boolean) => xs.reduce((a, s) => a + (cut && s.floor ? s.floor.length : s.text.length), 0) + GAP * Math.max(0, xs.length - 1);
  const fits = (xs: Signal[], restN: number, cut: boolean) => width(xs, cut) + (restN > 0 ? GAP + MORE : 0) <= room;
  const foldable = () => keep.filter((s) => s.fold !== null && s.kind !== "waiting");
  // What folds is decided against waiting at its floor (its names cut);
  // whether it is cut is decided after, against what stays.
  for (;;) {
    if (fits(keep, signals.length - keep.length, true)) break;
    const f = foldable();
    if (f.length === 0) break;
    // The soonest to fold leaves first; among equals, the last one.
    const min = Math.min(...f.map((s) => s.fold!));
    const out = [...f].reverse().find((s) => s.fold === min)!;
    keep.splice(keep.indexOf(out), 1);
  }
  const rest = signals.filter((s) => !keep.includes(s));
  return { shown: keep, rest, cut: !fits(keep, rest.length, false) && keep.some((s) => s.floor) };
}
