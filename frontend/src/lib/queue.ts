import type { AgentGroup, BoardView, CellThread } from "../hooks/useWails";

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
