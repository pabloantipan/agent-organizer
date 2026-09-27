import type { AgentGroup, AgentsView, BoardView } from "../hooks/useWails";
import type { merge, model } from "../../wailsjs/go/models";
import { leadOf, needsMeRows } from "./queue";

/** One state per initiative, what Home says at a glance (FR-6 of
 *  docs/specs/twenty-at-a-glance.md). First match wins, in this order:
 *
 *  1. waits on you: it has rows in Needs me (needsMeRows, the one queue,
 *     which holds only the lead's records, FR-8);
 *  2. executing: a wave has a card building, or a live agent is joined to
 *     one of its cards (A3: `now` cards with nobody on them are quiet);
 *  3. waits on business: a `proposed` record whose owner is neither the
 *     lead nor the FSE;
 *  4. quiet.
 *
 *  Everything comes from what the store already holds: the board and the
 *  agents feed. Nothing here reads or writes a file. */
export type InitiativeState = "you" | "executing" | "business" | "quiet";

export const STATE_ORDER: InitiativeState[] = ["you", "executing", "business", "quiet"];

export const STATE_WORD: Record<InitiativeState, string> = {
  you: "waits on you",
  executing: "executing",
  business: "waits on business",
  quiet: "quiet",
};

const FSE = "fse";

const owner = (d: model.Decision) => (d.owner ?? "").trim().toLowerCase();

const executing = (group: AgentGroup | undefined) =>
  !!group && (
    (group.waves ?? []).some((w) => (w.building?.length ?? 0) > 0) ||
    (group.agents ?? []).some((a) => !!a.card && (a.state === "working" || a.state === "running"))
  );

const waitsOnBusiness = (i: merge.BoardInitiative, lead: string) =>
  (i.decisions ?? []).some((d) => {
    const o = owner(d);
    return d.status === "proposed" && o !== "" && o !== lead && o !== FSE;
  });

/** The state of every initiative on the board, by id. An initiative on two
 *  machines is judged by its local row, the one the agents feed describes. */
export function initiativeStates(view: BoardView | null, agents: AgentsView | null): Map<string, InitiativeState> {
  const out = new Map<string, InitiativeState>();
  const rows = needsMeRows(view, agents);
  const groups = new Map((agents?.groups ?? []).map((g) => [g.id, g]));
  for (const i of [...(view?.board.initiatives ?? [])].sort((a, b) => Number(b.local) - Number(a.local))) {
    if (out.has(i.id)) continue;
    const group = groups.get(i.id);
    const lead = leadOf(group);
    let state: InitiativeState = "quiet";
    if (rows.some((r) => r.initiative === i.id)) state = "you";
    else if (executing(group)) state = "executing";
    else if (waitsOnBusiness(i, lead)) state = "business";
    out.set(i.id, state);
  }
  return out;
}

/** The current stage's phase as a word: discovery, building, "no phase"
 *  when the stage names none, "roadmap done" when every stage is, and
 *  "no roadmap" when there are no stages. */
export function phaseWord(stages: model.Stage[] | undefined): string {
  if (!stages || stages.length === 0) return "no roadmap";
  const cur = stages.find((s) => s.current);
  if (!cur) return "roadmap done";
  return cur.phase || "no phase";
}
