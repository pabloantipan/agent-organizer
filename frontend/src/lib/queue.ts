import type { AgentGroup, AgentsView, BoardView, CellThread, Seat } from "../hooks/useWails";
import type { merge, model } from "../../wailsjs/go/models";
import { parseISO } from "./dates";

/** One definition of the human's queue, used by the tab badge, the mailbox
 *  list, the Agents pill and the Slack chat list, so every count agrees.
 *  A thread needs the human when it is escalated or asks them; a card when
 *  its next action is addressed to them; a Solved mark removes either. Deaf
 *  seats are counted apart, and a capped seat is not deaf: it is alive and
 *  posting, only unreachable until restarted. */
export const ASKED_RE = /^\s*(pablo|decide)\b/i;

export const needsMeThread = (t: CellThread) => t.status === "escalated" || (t.asked_of_me ?? 0) > 0;

export function askedCards(view: BoardView | null, initiativeId: string) {
  return (["now", "blocked", "next"] as const)
    .flatMap((st) => view?.board.columns?.[st] ?? [])
    .filter((c) => c.initiative_id === initiativeId && c.local && ASKED_RE.test(c.next || ""));
}

export function queueOf(group: AgentGroup, view: BoardView | null) {
  const resolved = view?.order?.resolved ?? {};
  const threads = (group.threads ?? []).filter((t) => needsMeThread(t) && !resolved[`thread:${t.id}`]);
  const cards = askedCards(view, group.id).filter((c) => !resolved[`card:${group.id}/${c.slug}`]);
  const seats = group.crew ?? [];
  const deaf = seats.filter((s) => s.deaf && !s.capped).length;
  const capped = seats.filter((s) => s.capped).length;
  return { threads, cards, deaf, capped, total: threads.length + cards.length };
}

/** One row of Needs me: a decision waiting on a ruling, a thread asking the
 *  human, a card addressed to them, or a seat mail cannot reach. `since` is
 *  when it started waiting (null when the source has no date, and those sort
 *  last); `key` is what openNeedsMe and the Solved marks name it by. */
export type NeedsMeRow =
  | { kind: "decision"; key: string; initiative: string; since: Date | null; decision: model.Decision }
  | { kind: "thread"; key: string; initiative: string; since: Date | null; thread: CellThread }
  | { kind: "card"; key: string; initiative: string; since: Date | null; card: merge.BoardCard }
  | { kind: "seat"; key: string; initiative: string; since: Date | null; seat: Seat };

const day = (s: string | undefined) => parseISO(s?.slice(0, 10));

/** Needs me (FR-15): queueOf over every cell plus the decision records
 *  waiting on a ruling, one list, oldest first. The top bar's one badge is
 *  its length, so the count always equals the rows. */
export function needsMeRows(view: BoardView | null, agents: AgentsView | null, now = new Date()): NeedsMeRow[] {
  const rows: NeedsMeRow[] = [];
  // An initiative on two machines reports its records twice; the local scan wins.
  const seen = new Set<string>();
  for (const i of [...(view?.board.initiatives ?? [])].sort((a, b) => Number(b.local) - Number(a.local))) {
    if (seen.has(i.id)) continue;
    seen.add(i.id);
    for (const d of i.decisions ?? []) {
      if (d.status === "proposed") rows.push({ kind: "decision", key: `decision:${i.id}/${d.number}`, initiative: i.id, since: day(d.raised), decision: d });
    }
  }
  for (const g of agents?.groups ?? []) {
    if (!g.cell) continue;
    const q = queueOf(g, view);
    for (const t of q.threads) rows.push({ kind: "thread", key: `thread:${t.id}`, initiative: g.id, since: new Date(now.getTime() - (t.age_seconds ?? 0) * 1000), thread: t });
    for (const c of q.cards) rows.push({ kind: "card", key: `card:${g.id}/${c.slug}`, initiative: g.id, since: day(c.updated), card: c });
    for (const s of g.crew ?? []) {
      if (s.deaf || s.capped) rows.push({ kind: "seat", key: `seat:${g.id}/${s.name}`, initiative: g.id, since: null, seat: s });
    }
  }
  const at = (r: NeedsMeRow) => r.since?.getTime() ?? Number.MAX_SAFE_INTEGER;
  return rows.sort((a, b) => at(a) - at(b));
}
