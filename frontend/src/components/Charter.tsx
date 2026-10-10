import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import type { merge, model } from "../../wailsjs/go/models";
import { dateWords } from "../lib/dates";
import { stagePosition } from "../lib/header";
import "../styles/charter.css";

/** What the initiative is, in the lead's words (leftovers-17 FR-2,
 *  initiatives-view Amendment 2 §2): the goal, the measure, the target in
 *  words, scope in and out, and the current stage with its outcome and
 *  position, verbatim from initiative.yaml and the roadmap, each missing one
 *  a muted `no … yet`. One component for the header's Details and the
 *  Initiatives card's Details, so the two never drift. `clamp` folds the
 *  long lines to two (the header, FR-10); the card shows them in full. */
export function Charter({ i, clamp = false }: { i: merge.BoardInitiative; clamp?: boolean }) {
  const line = (key: string, name: string, cls: string, label: string, text: ReactNode) => (
    <Line key={`${key}-${i.id}`} clamp={clamp} name={name} className={cls}><span className="lbl">{label}</span>{text}</Line>
  );
  return (
    <div className="charter ihead-cols" data-charter={i.id}>
      <div className="charter-col ihead-col">
        {line("goal", "Goal", `ihead-goal ${i.goal ? "" : "missing"}`, "Goal", i.goal || "no goal yet")}
        {line("measure", "Measure", `ihead-measure ${i.measure ? "" : "missing"}`, "Measure", i.measure || "no measure yet")}
        <div className={`charter-line ihead-target-line ${i.target ? "" : "missing"}`}>
          <span className="lbl">Target</span>{i.target ? <span className="num">{dateWords(i.target)}</span> : "no target yet"}
        </div>
      </div>
      <div className="charter-col ihead-col">
        <ScopeLines id={i.id} scope={i.scope} clamp={clamp} />
        <StageLine stages={i.stages ?? []} />
      </div>
    </div>
  );
}

/** The current stage with its outcome and its place (`3 of 5`); every stage
 *  done says so; no roadmap says `no roadmap yet`. */
function StageLine({ stages }: { stages: model.Stage[] }) {
  if (stages.length === 0) return <div className="charter-line missing"><span className="lbl">Stage</span>no roadmap yet</div>;
  const pos = stagePosition(stages);
  if (pos.current < 0) return <div className="charter-line"><span className="lbl">Stage</span>{pos.label}</div>;
  const s = stages[pos.current];
  return (
    <div className="charter-line">
      <span className="lbl">Stage</span>
      <span className="mono">{s.title || s.id}</span>
      {s.outcome ? <> — “{s.outcome}”</> : <span className="none"> — no outcome yet</span>}
      {" "}<span className="num">({pos.current + 1} of {stages.length})</span>
    </div>
  );
}

/** Scope in and out (twenty-at-a-glance FR-4), in the owner's words, each
 *  side clamped to two lines like the goal (initiative-header FR-1) when
 *  clamped, or "no scope yet" when both lists are empty. */
function ScopeLines({ id, scope, clamp }: { id: string; scope?: model.Scope; clamp: boolean }) {
  const inScope = scope?.in ?? [];
  const outScope = scope?.out ?? [];
  if (inScope.length === 0 && outScope.length === 0) {
    return <div className="ihead-scope missing"><span className="lbl">Scope</span>no scope yet</div>;
  }
  const line = (label: string, name: string, items: string[]) => (
    <Line key={`${label}-${id}`} clamp={clamp} name={name} className="ihead-scope">
      <span className="lbl">{label}</span>
      {items.length === 0 ? (
        <span className="none">none written</span>
      ) : (
        <ul>{items.map((x, k) => <li key={k}>{x}</li>)}</ul>
      )}
    </Line>
  );
  return (
    <>
      {line("In scope", "Scope in", inScope)}
      {line("Out of scope", "Scope out", outScope)}
    </>
  );
}

function Line({ clamp, name, className, children }: { clamp: boolean; name: string; className: string; children: ReactNode }) {
  if (clamp) return <Clamped name={name} className={className}>{children}</Clamped>;
  return <div className={`charter-line ${className}`}>{children}</div>;
}

/** A header line clamped to two lines (FR-10): "more" shows the rest and
 *  "less" folds it again; no control when the text fits. Whether it is
 *  clamped is measured, so it follows the window width. The control is named
 *  by what it opens, "Goal, more" (initiative-header FR-15). */
export function Clamped({ name, className, children }: { name: string; className: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [clamped, setClamped] = useState(false);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || open) return;
    const measure = () => setClamped(el.scrollHeight > el.clientHeight + 1);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [open, children]);
  return (
    <div className={`clamp-line ${className}`}>
      <div ref={ref} className={`clamp-text ${open ? "" : "clamped"}`}>{children}</div>
      {(clamped || open) && (
        <button className="clamp-more" aria-expanded={open} aria-label={`${name}, ${open ? "less" : "more"}`} onClick={() => setOpen(!open)}>
          {open ? "less" : "more"}
        </button>
      )}
    </div>
  );
}
