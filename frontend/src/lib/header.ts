import type { model } from "../../wailsjs/go/models";
import { isRulable, isWithCells, ownerPerson } from "./decisions";

/** A run of stages under one phase word (initiative-header FR-3, §4). */
export type PhaseRun = { phase: string; stages: { stage: model.Stage; n: number }[] };

/** The stages grouped by phase for the strip. With one phase for every stage
 *  (or none at all) `single` names it (or is "") and there is one run with
 *  no word of its own; otherwise each run of the same phase is its own group,
 *  a divider between them. A stage with no phase sits in its neighbours' run:
 *  the one before it, or the one after it when it leads. */
export function phaseRuns(stages: model.Stage[]): { single: string | null; runs: PhaseRun[] } {
  const phases = stages.map((s) => s.phase || "");
  const distinct = [...new Set(phases.filter((p) => p))];
  const all = stages.map((stage, k) => ({ stage, n: k + 1 }));
  if (distinct.length <= 1) return { single: distinct[0] ?? "", runs: [{ phase: "", stages: all }] };
  // Leading phaseless stages take the first phase that follows them.
  const first = phases.find((p) => p) as string;
  const runs: PhaseRun[] = [];
  for (const x of all) {
    const p = x.stage.phase || (runs.length ? runs[runs.length - 1].phase : first);
    const last = runs[runs.length - 1];
    if (last && last.phase === p) last.stages.push(x);
    else runs.push({ phase: p, stages: [x] });
  }
  return { single: null, runs };
}

/** Where the roadmap stands, for the strip's label and the folded bar:
 *  "stage 5 of 6", or "all 6 stages done" when none is current. */
export function stagePosition(stages: model.Stage[]): { current: number; label: string } {
  const cur = stages.findIndex((s) => s.current);
  if (cur >= 0) return { current: cur, label: `stage ${cur + 1} of ${stages.length}` };
  return { current: -1, label: `all ${stages.length} stages done` };
}

/** The waiting chip's words (FR-2, 0068; leftovers-62 FR-5, DS7 and its
 *  Amendment 1): the header counts every record waiting on a ruling, the
 *  lead's share is the ones the lead owns (or with no owner, which asks the
 *  lead, 0034), the FSE panel's "waiting on you". Equal, "N decisions
 *  waiting on you"; none of them the lead's, "N decisions waiting"; between,
 *  both counts: "N decisions waiting · M on you". "1 decision" for one.
 *  Null at zero: the chip is not drawn. The chip's text is its accessible
 *  name, so both counts are said in words. */
export function waitingChip(decisions: model.Decision[] | undefined, lead: string): string | null {
  const waiting = (decisions ?? []).filter(isRulable);
  if (waiting.length === 0) return null;
  const mine = waiting.filter((d) => {
    const o = ownerPerson(d.owner);
    return o === "" || o === lead;
  }).length;
  const noun = waiting.length === 1 ? "decision" : "decisions";
  return `${waiting.length} ${noun} waiting${leadShare(waiting.length, mine)}`;
}

/** The lead's share after the header's count (DS7, Amendment 1): the one
 *  place the three cases are told apart. */
function leadShare(all: number, mine: number): string {
  if (mine === all) return " on you";
  if (mine === 0) return "";
  return ` · ${mine} on you`;
}

/** The record the chip lands on: the oldest waiting one, as Decisions lists
 *  them (raised ascending), the lower number on a tie. */
export function firstWaiting(decisions: model.Decision[] | undefined): string | null {
  return oldest((decisions ?? []).filter(isRulable));
}

const oldest = (records: model.Decision[]) => {
  const sorted = [...records].sort((a, b) => (a.raised ?? "").localeCompare(b.raised ?? "") || a.number.localeCompare(b.number));
  return sorted[0]?.number ?? null;
};

/** The header's quiet line beside the chip (leftovers-61 FR-3, DS3):
 *  "· N with the cells" after the lead's count, "N with the cells" alone
 *  when nothing waits on the lead; null at zero. Muted, no badge: it is a
 *  signal, not a call to act. */
export function withCellsLine(decisions: model.Decision[] | undefined): string | null {
  const n = (decisions ?? []).filter(isWithCells).length;
  if (n === 0) return null;
  return `${n} with the cells`;
}

/** The record the "with the cells" line lands on, so Decisions opens at that
 *  group: the oldest of them, as the group lists them. */
export function firstWithCells(decisions: model.Decision[] | undefined): string | null {
  return oldest((decisions ?? []).filter(isWithCells));
}
