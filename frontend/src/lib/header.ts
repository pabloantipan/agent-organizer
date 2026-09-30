import type { model } from "../../wailsjs/go/models";

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

/** The waiting chip's words (FR-2, 0068): "N decisions waiting on you" when
 *  every waiting record is the lead's (or has no owner, which asks the lead,
 *  0034), else "N decisions waiting"; "1 decision" for one. Null at zero: the
 *  chip is not drawn. */
export function waitingChip(decisions: model.Decision[] | undefined, lead: string): string | null {
  const waiting = (decisions ?? []).filter((d) => d.status === "proposed");
  if (waiting.length === 0) return null;
  const mine = waiting.every((d) => {
    const o = (d.owner ?? "").trim().toLowerCase();
    return o === "" || o === lead;
  });
  const noun = waiting.length === 1 ? "decision" : "decisions";
  return `${waiting.length} ${noun} waiting${mine ? " on you" : ""}`;
}

/** The record the chip lands on: the oldest waiting one, as Decisions lists
 *  them (raised ascending), the lower number on a tie. */
export function firstWaiting(decisions: model.Decision[] | undefined): string | null {
  const waiting = (decisions ?? []).filter((d) => d.status === "proposed");
  waiting.sort((a, b) => (a.raised ?? "").localeCompare(b.raised ?? "") || a.number.localeCompare(b.number));
  return waiting[0]?.number ?? null;
}
