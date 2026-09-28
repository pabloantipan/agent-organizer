import { useEffect, useRef, useState } from "react";
import { Briefcase, ChevronDown, ChevronRight, CircleDashed, Compass, Hammer, Hand, Play } from "lucide-react";
import type { merge, model, service } from "../../wailsjs/go/models";
import { needsMeRows, type NeedsMeRow } from "../lib/queue";
import { initiativeStates, phaseWord, STATE_WORD, type InitiativeState } from "../lib/initiativeState";
import { uniq } from "../lib";
import { useBoard } from "../stores/board.store";
import { nextDate, stageState, waitingDecisions } from "./InitiativeHeader";
import { InitiativeDetail } from "./Initiatives";
import { RuleDecisionBox } from "./RuleDecisionBox";
import "../styles/home.css";

/** Home: what needs me, and where every initiative stands (FR-15, FR-16).
 *  Needs me is one list, oldest first, one verb per row; its length is the
 *  top bar's one badge. Below it, the initiatives in the rail's order. */
export function Home() {
  const { view, agents } = useBoard();
  if (!view) return <div className="empty">Loading…</div>;
  const rows = needsMeRows(view, agents);
  return (
    <div className="home">
      <section className="home-sec">
        <h2 className="sec-title">Needs me <span className="num sec-count">{rows.length}</span><span className="sec-sub">decisions, threads, cards and seats, oldest first</span></h2>
        {rows.length === 0 ? (
          <div className="panel empty-state">
            <div>Nothing waits on you.</div>
            <div className="sub">Decisions waiting on a ruling, threads asking you, and cards addressed to you land here.</div>
          </div>
        ) : (
          <div className="panel inbox">
            {rows.map((r) => <InboxRow key={r.key} row={r} />)}
          </div>
        )}
      </section>
      <section className="home-sec">
        <h2 className="sec-title">Initiatives <span className="sec-sub">by priority</span></h2>
        <Initiatives view={view} />
      </section>
    </div>
  );
}

const age = (since: Date | null) => {
  if (!since) return "—";
  const s = Math.max(0, (Date.now() - since.getTime()) / 1000);
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86400)}d`;
};

/** The shell every Needs me row shares: reason lozenge, subject with one
 *  line of context, age, one verb. Highlighted and scrolled to when
 *  openNeedsMe names it. */
function Shell({ row, reason, tone, subject, context, children }: { row: NeedsMeRow; reason: string; tone: string; subject: React.ReactNode; context: React.ReactNode; children: React.ReactNode }) {
  const { needsMeFocus } = useBoard();
  const ref = useRef<HTMLDivElement>(null);
  const focused = needsMeFocus === row.key;
  useEffect(() => { if (focused) ref.current?.scrollIntoView({ block: "center", behavior: "smooth" }); }, [focused]);
  return (
    <div ref={ref} className={`ib-row ${focused ? "focused" : ""}`} data-key={row.key}>
      <span className={`lz ${tone}`}>{reason}</span>
      <span className="ib-what">
        <span className="ib-subject">{subject}</span>
        <span className="ib-context">{context}</span>
      </span>
      <span className="ib-age num" title={row.since ? row.since.toLocaleString() : "no date on this"}>{age(row.since)}</span>
      <span className="ib-act">{children}</span>
    </div>
  );
}

function InboxRow({ row }: { row: NeedsMeRow }) {
  const { openSlackThread, openInitiative, select } = useBoard();
  switch (row.kind) {
    case "decision":
      return <DecisionRow row={row} decision={row.decision} />;
    case "thread": {
      const t = row.thread;
      const escalated = t.status === "escalated";
      return (
        <Shell row={row} reason={escalated ? "escalated" : "question"} tone={escalated ? "danger" : "tone"}
          subject={<><span className="mono">{row.initiative}</span> · {t.subject}</>}
          context={`${escalated ? "escalated to you" : `${t.asked_by || "a seat"} asks you`} · ${t.messages} message${t.messages === 1 ? "" : "s"}`}>
          <button className="act primary" onClick={() => openSlackThread(row.initiative, t.id)}>Answer</button>
        </Shell>
      );
    }
    case "card": {
      const c = row.card;
      return (
        <Shell row={row} reason="card" tone="blocked"
          subject={<><span className="mono">{row.initiative}</span> · {c.title}</>}
          context={c.next}>
          <button className="act" onClick={() => select(c)}>Open</button>
        </Shell>
      );
    }
    case "seat": {
      const s = row.seat;
      return (
        <Shell row={row} reason={s.capped ? "capped seat" : "deaf seat"} tone={s.capped ? "tone" : "danger"}
          subject={<><span className="mono">{row.initiative}</span> · <span className="mono">{s.name}</span> {s.capped ? "hit the drain ceiling" : "is not picking up mail"}</>}
          context={s.capped ? "restart its session with probe -r" : `${s.undelivered} undelivered`}>
          <button className="act" onClick={() => openInitiative(row.initiative, "agents")}>Agents</button>
        </Shell>
      );
    }
  }
}

/** A decision waiting on a ruling. Its action is a slot: RuleAction opens
 *  the box that writes the ruling (FR-22). */
function DecisionRow({ row, decision: d }: { row: NeedsMeRow; decision: model.Decision }) {
  const opts = d.options ?? [];
  return (
    <Shell row={row} reason="decision" tone="waiting"
      subject={<><span className="mono">{row.initiative} {d.number}</span> · {d.title}</>}
      context={<>owner {d.owner || "—"} · raised <span className="num">{d.raised || "—"}</span>{d.raised_by ? ` by ${d.raised_by}` : ""}{opts.length > 0 ? ` · options: ${opts.join(", ")}` : ""}</>}>
      <RuleAction initiative={row.initiative} decision={d} />
    </Shell>
  );
}

function RuleAction({ initiative, decision }: { initiative: string; decision: model.Decision }) {
  const [open, setOpen] = useState(false);
  return (
    <span className="rb-anchor">
      <button className="act primary" aria-expanded={open} onClick={() => setOpen(!open)}>Rule</button>
      {open && <RuleDecisionBox initiative={initiative} decision={decision} onClose={() => setOpen(false)} />}
    </span>
  );
}

/** The initiatives by priority, one row each (H3): its state and phase
 *  (FR-6 of twenty-at-a-glance), goal or "no goal yet", a compact stage
 *  stepper, its signals and its next real date. A row opens
 *  the initiative; the chevron shows repos, problems and actions in place. */
function Initiatives({ view }: { view: NonNullable<ReturnType<typeof useBoard.getState>["view"]> }) {
  const { agents, openInitiative } = useBoard();
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const all = view.board.initiatives ?? [];
  const ids = uniq(all.map((i) => i.id));
  const cols = view.board.columns ?? {};
  const states = initiativeStates(view, agents);
  if (ids.length === 0) {
    return (
      <div className="panel empty-state">
        <div>No initiatives found.</div>
        <div className="sub">Add a root that holds a working-on/initiative.yaml in Settings.</div>
      </div>
    );
  }
  return (
    <div className="panel port" role="table">
      <div className="p-head" role="row">
        <span className="num">#</span><span>initiative</span><span>state</span><span>phase</span><span>goal</span><span>stage</span><span>signals</span><span>next date</span><span />
      </div>
      {ids.map((id, k) => {
        const rows = all.filter((i) => i.id === id);
        const i = rows.find((r) => r.local) ?? rows[0];
        const cards = (["now", "blocked", "next"] as const).flatMap((st) => (cols[st] ?? []).filter((c) => c.initiative_id === id));
        const group = agents?.groups?.find((g) => g.id === id);
        return (
          <div key={id} className="p-item">
            <div className="p-row" role="row">
              <span className="p-rank num">{k + 1}</span>
              <button className="p-id" onClick={() => openInitiative(id, "overview")} title={i.title}>{id}</button>
              <StateLz state={states.get(id) ?? "quiet"} />
              <Phase stages={i.stages ?? []} />
              <span title={i.goal || undefined} className={`p-goal ${i.goal ? "" : "missing"}`}>{i.goal || "no goal yet"}</span>
              <MiniStepper stages={i.stages ?? []} />
              <Signals i={i} rows={rows} cards={cards} waves={group?.waves ?? []} />
              <NextDate i={i} cards={cards} />
              <button className="p-more ghost" onClick={() => setOpen({ ...open, [id]: !open[id] })} aria-expanded={!!open[id]} title={open[id] ? "hide details" : "repos, problems and actions"}>
                {open[id] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>
            </div>
            {open[id] && <div className="p-detail"><InitiativeDetail i={i} /></div>}
          </div>
        );
      })}
    </div>
  );
}

/** Home's compact stepper: one segment per stage and the current one named.
 *  Fewer than three stages are words only (design system, Stage stepper). */
function MiniStepper({ stages }: { stages: model.Stage[] }) {
  if (stages.length === 0) return <span className="p-stage"><span className="stage-lbl missing">no roadmap</span></span>;
  const cur = stages.findIndex((s) => s.current);
  const label = cur >= 0 ? <><span className="num">{cur + 1}</span> · {stages[cur].title} · now</> : <>all <span className="num">{stages.length}</span> done</>;
  return (
    <span className="p-stage">
      {stages.length >= 3 && (
        <span className="stepper" aria-hidden="true">
          {stages.map((s, k) => <i key={k} className={stageState(s)} title={`${k + 1} · ${s.title}`} />)}
        </span>
      )}
      <span className="stage-lbl">{stages.length < 3 && cur >= 0 ? <>stage <span className="num">{cur + 1} of {stages.length}</span> · {stages[cur].title}</> : label}</span>
    </span>
  );
}

function Signals({ i, rows, cards, waves }: { i: merge.BoardInitiative; rows: merge.BoardInitiative[]; cards: merge.BoardCard[]; waves: service.Wave[] }) {
  const waiting = waitingDecisions(i);
  const blocked = cards.filter((c) => c.status === "blocked").length;
  const now = cards.filter((c) => c.status === "now").length;
  const live = rows.reduce((a, r) => a + (r.live ?? 0), 0);
  const working = rows.reduce((a, r) => a + (r.working ?? 0), 0);
  const running = waves.filter((w) => (w.building?.length ?? 0) > 0);
  const problems = i.problems?.length ?? 0;
  const none = !waiting && !blocked && !now && !live && !running.length && !problems;
  return (
    <span className="p-sig">
      {waiting > 0 && <span className="lz waiting"><span className="num">{waiting}</span> waiting</span>}
      {blocked > 0 && <span className="lz blocked"><span className="num">{blocked}</span> blocked</span>}
      {now > 0 && <span className="lz now"><span className="num">{now}</span> now</span>}
      {running.map((w) => <span key={w.n} className="lz live">wave <span className="num">{w.n}</span> · <span className="num">{w.building!.length}</span> building</span>)}
      {live > 0 && <span className="lz">{working > 0 ? <><span className="num">{working}</span> working</> : <><span className="num">{live}</span> live</>}</span>}
      {problems > 0 && <span className="lz warning"><span className="num">{problems}</span> problem{problems === 1 ? "" : "s"}</span>}
      {none && <span className="p-quiet" title="no signals">—</span>}
    </span>
  );
}

const STATE_ICON: Record<InitiativeState, typeof Hand> = { you: Hand, executing: Play, business: Briefcase, quiet: CircleDashed };

/** The one state of FR-6: a word with its own icon, never colour alone. */
function StateLz({ state }: { state: InitiativeState }) {
  const Icon = STATE_ICON[state];
  return (
    <span className="p-state">
      <span className={`lz st-${state}`}><Icon size={12} strokeWidth={2} aria-hidden="true" />{STATE_WORD[state]}</span>
    </span>
  );
}

/** The current stage's phase as a word, or "no roadmap". */
function Phase({ stages }: { stages: model.Stage[] }) {
  const word = phaseWord(stages);
  const Icon = word === "discovery" ? Compass : word === "building" ? Hammer : null;
  return (
    <span className={`p-phase ${Icon ? "" : "missing"}`}>
      {Icon && <Icon size={12} strokeWidth={2} aria-hidden="true" />}{word}
    </span>
  );
}

function NextDate({ i, cards }: { i: merge.BoardInitiative; cards: merge.BoardCard[] }) {
  const n = nextDate(i, cards);
  if (!n) return <span className="p-next"><span className="num" title="no card due, milestone or target ahead">—</span></span>;
  return (
    <span className="p-next">
      <span className="num">{n.date}</span>
      <span className="p-next-what">{n.what}</span>
    </span>
  );
}
