import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { ChevronDown, ChevronRight, Code2, FileText, Lock, Route } from "lucide-react";
import type { merge, model } from "../../wailsjs/go/models";
import { dateWords, parseISO, today } from "../lib/dates";
import { api } from "../hooks/useWails";
import { firstWaiting, phaseRuns, stagePosition, waitingChip } from "../lib/header";
import { leadOf, readOnlyOf } from "../lib/queue";
import { useScrollEdges } from "../lib/useScrollEdges";
import { useBoard, type Sub } from "../stores/board.store";
import "../styles/header.css";

/** A stage's state for the stepper: done when ruled so, current as the scan
 *  stamped it (the first without done), planned otherwise. */
export function stageState(s: model.Stage): "done" | "current" | "planned" {
  if (s.done) return "done";
  if (s.current) return "current";
  return "planned";
}

/** One line for a stage's exit: the first item not met, or that all are. */
export function exitLine(s: model.Stage): string {
  const items = s.exit ?? [];
  if (items.length === 0) return s.outcome || "no exit written";
  const open = items.filter((x) => !parseISO(x.met));
  if (open.length === 0) return `exit met, ${items.length}/${items.length}`;
  return `exit: ${open[0].text}`;
}

/** The next real date of an initiative: the earliest of its open cards' due,
 *  its milestones and its target that is today or later. Never computed. */
export function nextDate(i: merge.BoardInitiative, cards: merge.BoardCard[]): { date: string; what: string } | null {
  const now = today().getTime();
  const all = [
    ...cards.filter((c) => c.due).map((c) => ({ date: c.due, what: `due · ${c.slug}` })),
    ...(i.milestones ?? []).map((m) => ({ date: m.date, what: `milestone · ${m.title}` })),
    ...(i.target ? [{ date: i.target, what: "target" }] : []),
  ].filter((x) => (parseISO(x.date)?.getTime() ?? -1) >= now);
  all.sort((a, b) => a.date.localeCompare(b.date));
  return all[0] ?? null;
}

/** A stage's phase as a word (FR-4), never a colour alone; nothing when the
 *  stage has none. */
export function PhaseWord({ phase }: { phase?: string }) {
  if (!phase) return null;
  return <span className="lz phase" title={`phase: ${phase}`}>{phase}</span>;
}

/** Scope in and out (twenty-at-a-glance FR-4), in the owner's words, each
 *  side clamped to two lines like the goal (initiative-header FR-1), or "no
 *  scope yet" when both lists are empty. */
function ScopeLines({ id, scope }: { id: string; scope?: model.Scope }) {
  const inScope = scope?.in ?? [];
  const outScope = scope?.out ?? [];
  if (inScope.length === 0 && outScope.length === 0) {
    return <div className="ihead-scope missing"><span className="lbl">Scope</span>no scope yet</div>;
  }
  const line = (label: string, name: string, items: string[]) => (
    <Clamped key={`${label}-${id}`} name={name} className="ihead-scope">
      <span className="lbl">{label}</span>
      {items.length === 0 ? (
        <span className="none">none written</span>
      ) : (
        <ul>{items.map((x, k) => <li key={k}>{x}</li>)}</ul>
      )}
    </Clamped>
  );
  return (
    <>
      {line("In scope", "Scope in", inScope)}
      {line("Out of scope", "Scope out", outScope)}
    </>
  );
}

const stateWord = (s: model.Stage) => {
  const st = stageState(s);
  return st === "done" ? "done" : st === "current" ? "now" : "";
};

/** The stage strip (initiative-header FR-3, FR-4): a label with the roadmap
 *  icon saying what it is and where it stands, the phase once in the label
 *  when every stage shares it, else a word over each run with a divider
 *  where it changes; each tile is a button that opens its stage in Roadmap.
 *  Compact shows numbers, with only the current stage's title. */
function StageStrip({ i, compact }: { i: merge.BoardInitiative; compact: boolean }) {
  const { openInitiative, openStage } = useBoard();
  const stages = i.stages ?? [];
  const roadmap = <button className="linkish" onClick={() => openInitiative(i.id, "roadmap")}>Roadmap</button>;
  if (stages.length === 0) {
    return <div className="stg-strip"><div className="stg-label"><Route size={13} aria-hidden />{roadmap}<span className="stg-sep">·</span>no roadmap yet</div></div>;
  }
  const { single, runs } = phaseRuns(stages);
  const pos = stagePosition(stages);
  return (
    <div className="stg-strip" role="group" aria-label={`Roadmap, ${single ? `${single}, ` : ""}${pos.label}`}>
      <div className="stg-label">
        <Route size={13} aria-hidden />{roadmap}
        {single && <><span className="stg-sep">·</span>{single}</>}
        <span className="stg-sep">·</span><span className="num">{pos.label}</span>
      </div>
      <div className={`stg-runs ${runs.length > 1 ? "phased" : ""}`}>
        {runs.map((r, k) => (
          <div key={k} className="stg-run" style={{ flexGrow: r.stages.length }}>
            {r.phase && <span className="stg-phase">{r.phase}</span>}
            <ol className="stg-tiles">
              {r.stages.map(({ stage: s, n }) => {
                const st = stageState(s);
                const word = stateWord(s);
                const title = s.title || s.id;
                const short = compact && st !== "current";
                return (
                  <li key={n} className={short ? "short" : ""}>
                    <button
                      className={`stg ${st}`}
                      aria-current={st === "current" ? "step" : undefined}
                      aria-label={`Stage ${n} of ${stages.length}: ${title}${word ? `, ${word}` : ""}. Open it in Roadmap`}
                      title={s.outcome ? `${title}\n${s.outcome}` : title}
                      onClick={() => openStage(i.id, n - 1)}
                    >
                      <span className="stg-n num">{n}{word && ` · ${word}`}</span>
                      {!short && <span className="stg-t">{title}</span>}
                      {!short && <span className="stg-x">{exitLine(s)}</span>}
                      <ChevronRight className="stg-chev" size={12} aria-hidden />
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>
        ))}
      </div>
    </div>
  );
}

/** A header line clamped to two lines (FR-10): "more" shows the rest and
 *  "less" folds it again; no control when the text fits. Whether it is
 *  clamped is measured, so it follows the window width. The control is named
 *  by what it opens, "Goal, more" (initiative-header FR-15). */
function Clamped({ name, className, children }: { name: string; className: string; children: ReactNode }) {
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

const SUBS: { id: Sub; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "work", label: "Work" },
  { id: "roadmap", label: "Roadmap" },
  { id: "decisions", label: "Decisions" },
  { id: "conversations", label: "Conversations" },
  { id: "agents", label: "Agents" },
];

/** The initiative header (FR-17; initiative-header FR-1): folded by default
 *  to one bar (id, stage, waiting chip, target, the goal on one line,
 *  Details); open, the charter (goal, measure, scope, where they are written)
 *  and the stage strip. The stored choice is the lead's Details toggle, and a
 *  landing stores "folded" (FR-11, board.store). No badge on a sub-view:
 *  Needs me is the one count. */
export function InitiativeHeader({ initiative: i }: { initiative: merge.BoardInitiative }) {
  const { sub, openInitiative, openDecision, openStage, view, agents, headerOpen, setHeaderOpen, widthClass } = useBoard();
  const lead = leadOf((agents?.groups ?? []).find((g) => g.id === i.id));
  const chip = waitingChip(i.decisions, lead);
  const first = firstWaiting(i.decisions);
  // FR-13: not active means read-only, said in words beside the id.
  const readOnly = readOnlyOf(view, i.id);
  const stages = i.stages ?? [];
  const pos = stagePosition(stages);
  const shownAt = pos.current >= 0 ? pos.current : stages.length - 1;
  const shown = stages[shownAt];
  const charter = `${i.path}/working-on/initiative.yaml`;
  // FR-17: at compact the bar keeps its stage while Details is open, since
  // the open header scrolls inside itself and the strip may scroll away.
  const compact = widthClass === "compact";
  const barStage = !headerOpen || compact;
  const openRef = useRef<HTMLDivElement>(null);
  const edges = useScrollEdges(openRef, headerOpen);
  return (
    <header className={`ihead ${headerOpen ? "open" : "folded"} ${widthClass}`}>
      <div className="ihead-bar">
        <h1 className="ihead-id">
          {i.id}
          {i.client && <span className="lz tone">{i.client}</span>}
          {readOnly && <span className="lz read-only" title="not active: nothing here can be ruled, moved, commented, posted or started"><Lock size={12} aria-hidden /> {readOnly}: read-only</span>}
        </h1>
        {barStage && (shown ? (
          <button className="ihead-stage" onClick={() => openStage(i.id, shownAt)} title={`${shown.title || shown.id}: open it in Roadmap`}
            aria-label={`Roadmap, ${pos.label}: ${shown.title || shown.id}. Open it in Roadmap`}>
            <Route size={13} aria-hidden />
            <span className="num">{pos.current >= 0 ? `Stage ${pos.current + 1} of ${stages.length} · now` : pos.label}</span>
            <span className="ihead-stage-t">· {shown.title || shown.id}</span>
            <ChevronRight className="stg-chev" size={12} aria-hidden />
          </button>
        ) : <span className="ihead-stage none"><Route size={13} aria-hidden /> no roadmap yet</span>)}
        {chip && first ? (
          <button className="lz waiting ihead-chip" onClick={() => openDecision(i.id, first)} title="open Decisions on the first record waiting on a ruling">{chip}</button>
        ) : headerOpen ? <span className="ihead-nochip">no decision waiting</span> : null}
        {i.target && <span className="ihead-target">target <b className="num">{dateWords(i.target)}</b></span>}
        {!headerOpen && <span className={`ihead-goal-line ${i.goal ? "" : "missing"}`} title={i.goal || undefined}>{i.goal || "no goal yet"}</span>}
        <span className="spacer" />
        <button className="ihead-details" aria-expanded={headerOpen} aria-controls={`ihead-open-${i.id}`} onClick={() => setHeaderOpen(!headerOpen)}>
          <ChevronDown size={14} aria-hidden /> {headerOpen ? "Hide details" : "Details"}
        </button>
      </div>
      {headerOpen && (
        <div ref={openRef} id={`ihead-open-${i.id}`} className={`ihead-open ${edges.top ? "edge-top" : ""} ${edges.bottom ? "edge-bottom" : ""}`}>
          <div className="ihead-cols">
            <div className="ihead-col">
              <Clamped key={`goal-${i.id}`} name="Goal" className={`ihead-goal ${i.goal ? "" : "missing"}`}>
                <span className="lbl">Goal</span>
                {i.goal || "no goal yet"}
              </Clamped>
              {i.measure && <Clamped key={`measure-${i.id}`} name="Measure" className="ihead-measure"><span className="lbl">Measure</span>{i.measure}</Clamped>}
            </div>
            <div className="ihead-col">
              <ScopeLines id={i.id} scope={i.scope} />
            </div>
          </div>
          {/* 0064, file only: where the charter is written, whether git sees it
              edited and not committed on this machine, and the way to change
              it. The app writes nothing to the file. */}
          <div className="ihead-source">
            <FileText size={12} aria-hidden /> from <span className="mono">working-on/initiative.yaml</span>
            {i.local && i.charter_modified && <span className="ihead-edited">edited, not committed</span>}
            {i.local && <button className="linkish" onClick={() => api.openInEditor(charter)}><Code2 size={12} aria-hidden /> Open initiative.yaml in editor</button>}
          </div>
          <StageStrip i={i} compact={compact} />
        </div>
      )}
      <nav className="subtabs" aria-label="initiative views">
        {SUBS.map((s) => (
          <button key={s.id} className={s.id === sub ? "on" : ""} aria-current={s.id === sub ? "page" : undefined} onClick={() => openInitiative(i.id, s.id)}>
            {s.label}
          </button>
        ))}
      </nav>
    </header>
  );
}
