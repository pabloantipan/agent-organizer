import type { merge, model } from "../../wailsjs/go/models";
import { parseISO, today } from "../lib/dates";
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

/** Decision records waiting on a ruling in one initiative. */
export const waitingDecisions = (i: merge.BoardInitiative) => (i.decisions ?? []).filter((d) => d.status === "proposed").length;

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

/** The stage stepper (design system, Stage stepper): number and state,
 *  title, exit in one line; done, current (named in words) or planned.
 *  Only for three or more stages; fewer are one line of words. */
export function StageStepper({ stages }: { stages: model.Stage[] }) {
  if (stages.length === 0) return <div className="stages-none">no roadmap yet</div>;
  if (stages.length < 3) {
    const cur = stages.findIndex((s) => s.current);
    const s = stages[cur >= 0 ? cur : stages.length - 1];
    return <div className="stages-none">stage <span className="num">{(cur >= 0 ? cur : stages.length - 1) + 1} of {stages.length}</span> · {s.title}{cur >= 0 ? " · now" : " · done"} <PhaseWord phase={s.phase} /></div>;
  }
  return (
    <ol className="stepper-full">
      {stages.map((s, k) => {
        const st = stageState(s);
        return (
          <li key={k} className={`stg ${st}`} aria-current={st === "current" ? "step" : undefined} title={s.outcome}>
            <span className="stg-head">
              <span className="stg-n num">{k + 1}{st === "done" ? " · done" : st === "current" ? " · now" : ""}</span>
              <PhaseWord phase={s.phase} />
            </span>
            <span className="stg-t">{s.title || s.id}</span>
            <span className="stg-x">{exitLine(s)}</span>
          </li>
        );
      })}
    </ol>
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

/** The initiative header (FR-17): goal, measure, target, the decisions
 *  waiting, and the stages with the current one marked; then the six
 *  sub-views. No badge on a sub-view: Needs me is the one count. */
export function InitiativeHeader({ initiative: i }: { initiative: merge.BoardInitiative }) {
  const { sub, openInitiative } = useBoard();
  const waiting = waitingDecisions(i);
  return (
    <header className="ihead">
      <div className="ihead-top">
        <div className="ihead-main">
          <h1 className="ihead-id">
            {i.id}
            {i.client && <span className="lz tone">{i.client}</span>}
          </h1>
          <div className={`ihead-goal ${i.goal ? "" : "missing"}`}>
            <span className="lbl">Goal</span>
            {i.goal || "no goal yet"}
          </div>
          {i.measure && <div className="ihead-measure"><span className="lbl">Measure</span>{i.measure}</div>}
        </div>
        <div className="ihead-side">
          <span className="ihead-target">target <b className="num">{i.target || "—"}</b></span>
          <button
            className={`lz ${waiting > 0 ? "waiting" : ""}`}
            onClick={() => openInitiative(i.id, "decisions")}
            title="decision records waiting on a ruling"
          >
            <span className="num">{waiting}</span> decision{waiting === 1 ? "" : "s"} waiting
          </button>
        </div>
      </div>
      <StageStepper stages={i.stages ?? []} />
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
