import type { merge } from "../../wailsjs/go/models";
import { endOf, when, type When } from "./axis";

/** A card's bar by the Cards rules (CLAUDE.md, Planning dates): start is the
 *  card's `start`, else the branch's first commit, else `updated`, else
 *  today; end is `due`, else today for `now` (open-ended), else the branch's
 *  last commit, else the start. A whole-day start and end on one day is a
 *  dot. Shared by Roadmap › Cards and the outline's card rows. */
export type CardBar = { start: When; end: When; openEnded: boolean; dot: boolean; overdue: boolean };

export function cardBar(c: Pick<merge.BoardCard, "start" | "branch_start" | "branch_last" | "updated" | "due" | "status">, today: number): CardBar {
  const todayW: When = { at: today, timed: false };
  const due = when(c.due);
  const start = when(c.start) ?? when(c.branch_start) ?? when(c.updated) ?? todayW;
  let end: When;
  let openEnded = false;
  if (due) end = due;
  else if (c.status === "now") { end = todayW; openEnded = true; }
  else end = when(c.branch_last) ?? start;
  if (endOf(end) < start.at) end = start;
  const dot = !openEnded && !start.timed && !end.timed && end.at <= start.at;
  return { start, end, openEnded, dot, overdue: !!due && due.at < today };
}
