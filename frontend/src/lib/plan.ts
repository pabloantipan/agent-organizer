import type { merge } from "../../wailsjs/go/models";
import { parseISO } from "./dates";

export type PlanItem =
  | { kind: "due"; date: Date; card: merge.BoardCard; initiative: string }
  | { kind: "milestone"; date: Date; title: string; initiative: string }
  | { kind: "target"; date: Date; initiative: string };

/** Every dated thing on the board, deduplicated per initiative id. */
export function planItems(board: merge.Board): PlanItem[] {
  const out: PlanItem[] = [];
  const seenInit = new Set<string>();
  for (const i of board.initiatives ?? []) {
    if (seenInit.has(i.id)) continue;
    seenInit.add(i.id);
    for (const m of i.milestones ?? []) {
      const d = parseISO(m.date);
      if (d) out.push({ kind: "milestone", date: d, title: m.title, initiative: i.id });
    }
    const t = parseISO(i.target);
    if (t) out.push({ kind: "target", date: t, initiative: i.id });
  }
  const seenCard = new Set<string>();
  for (const st of ["now", "blocked", "next"]) {
    for (const c of board.columns?.[st] ?? []) {
      const key = `${c.initiative_id}/${c.slug}`;
      if (seenCard.has(key)) continue;
      seenCard.add(key);
      const d = parseISO(c.due);
      if (d) out.push({ kind: "due", date: d, card: c, initiative: c.initiative_id });
    }
  }
  out.sort((a, b) => a.date.getTime() - b.date.getTime());
  return out;
}
