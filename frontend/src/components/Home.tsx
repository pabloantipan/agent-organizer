import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Briefcase, ChevronDown, ChevronRight, CircleDashed, Compass, Hammer, Hand, Play } from "lucide-react";
import type { merge, model, service } from "../../wailsjs/go/models";
import { inactiveIds, launchVerb, missingPersonas, needsMeRows, type NeedsMeRow } from "../lib/queue";
import { initiativeStates, phaseWord, STATE_WORD, type InitiativeState } from "../lib/initiativeState";
import { uniq } from "../lib";
import { HEALTH, messages } from "../lib/health";
import { ownerPhrase, waitingDecisions, waitingOwners } from "../lib/decisions";
import { useBoard } from "../stores/board.store";
import { nextDate, stageState } from "./InitiativeHeader";
import { InitiativeDetail } from "./Initiatives";
import { RuleDecisionBox } from "./RuleDecisionBox";
import { CellStateLz, IN_DEFINITION_WAITS } from "./Crew";
import "../styles/home.css";

/** Home: what needs me, and where every initiative stands (FR-15, FR-16).
 *  Needs me is one list, oldest first, one verb per row; its length is the
 *  top bar's one badge. Below it, the active initiatives in the rail's order;
 *  the rest sit in the rail's Not active group (FR-9). */
export function Home() {
  const { view, agents } = useBoard();
  if (!view) return <div className="empty">Loading…</div>;
  const rows = needsMeRows(view, agents);
  return (
    <div className="home">
      <section className="home-sec">
        <h2 id={NEEDS_ME_HEADING} tabIndex={-1} className="sec-title">Needs me <span className="num sec-count">{rows.length}</span><span className="sec-sub">everything waiting on you, oldest first</span></h2>
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
  const { openSlackThread, openInitiative, openAgentsAt, select } = useBoard();
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
          <button className="act" aria-label={`Answer ${row.initiative} ${t.subject}`} onClick={() => openSlackThread(row.initiative, t.id)}>Answer</button>
        </Shell>
      );
    }
    case "card": {
      const c = row.card;
      return (
        <Shell row={row} reason="card" tone="blocked"
          subject={<><span className="mono">{row.initiative}</span> · {c.title}</>}
          context={c.next}>
          <button className="act" aria-label={`Open ${row.initiative} ${c.title || c.slug}`} onClick={() => select(c)}>Open</button>
        </Shell>
      );
    }
    case "seat": {
      const s = row.seat;
      const h = HEALTH[s.capped ? "capped" : "deaf"];
      return (
        <Shell row={row} reason={`${h.label} seat`} tone={s.capped ? "tone" : "danger"}
          subject={<><span className="mono">{row.initiative}</span> · <span className="mono">{s.name}</span> {h.blocker}{s.undelivered > 0 ? ` · ${messages(s.undelivered)} waiting` : ""}</>}
          context={`${h.why} ${h.what}`}>
          <button className="act" aria-label={`Agents ${row.initiative} ${s.name}`} onClick={() => openInitiative(row.initiative, "agents")}>Agents</button>
        </Shell>
      );
    }
    case "launch": {
      const n = row.cell.agents?.length ?? 0;
      const { verb, blocker } = launchVerb(row);
      return (
        <Shell row={row} reason="cell" tone="tone"
          subject={<><span className="mono">{row.initiative}</span> · <span className="mono">{row.cell.project}</span> in definition</>}
          context={blocker ?? `${n} seat${n === 1 ? "" : "s"}; ${IN_DEFINITION_WAITS}`}>
          {verb === "Open"
            ? <button className="act" aria-label={`Open ${row.initiative} ${row.missing}`} onClick={() => openAgentsAt(row.initiative, `seat:${row.missing}`)} title={`open its Agents: agents/${row.missing}.md is missing`}>Open</button>
            : <button className="act" aria-label={`Launch ${row.initiative}`} onClick={() => openAgentsAt(row.initiative, "crew-up")} title="open its Agents, where Bring crew up is">Launch</button>}
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
      context={<>{ownerPhrase(d.owner)} · raised <span className="num">{d.raised || "—"}</span>{d.raised_by ? ` by ${d.raised_by}` : ""}{opts.length > 0 ? ` · options: ${opts.join(", ")}` : ""}</>}>
      <RuleAction initiative={row.initiative} decision={d} />
    </Shell>
  );
}

/** Rule on a Needs me row: a disclosure, so it stays marked while its box
 *  is open (aria-expanded and --surface-selected, ui-leftovers FR-4), and
 *  its name carries the record (FR-6). Focus comes back to it when the box
 *  closes; once the ruling lands the row is gone, and focus goes to the
 *  Needs me heading (FR-5). */
function RuleAction({ initiative, decision }: { initiative: string; decision: model.Decision }) {
  const [open, setOpen] = useState(false);
  const btn = useRef<HTMLButtonElement>(null);
  return (
    <span className="rb-anchor">
      <button ref={btn} className="act" aria-expanded={open} aria-label={`Rule ${initiative} ${decision.number}`} onClick={() => setOpen(!open)}>Rule</button>
      {open && <RuleDecisionBox initiative={initiative} decision={decision} withRecord opener={btn} afterRule={focusNeedsMe} onClose={() => setOpen(false)} />}
    </span>
  );
}

const NEEDS_ME_HEADING = "needs-me-heading";
const focusNeedsMe = () => document.getElementById(NEEDS_ME_HEADING)?.focus();

/** The initiatives by priority, one row each (H3): its state and phase
 *  (FR-6 of twenty-at-a-glance), goal or "no goal yet", a compact stage
 *  stepper, its signals and its next real date. A row opens
 *  the initiative; the chevron shows repos, problems and actions in place. */
function Initiatives({ view }: { view: NonNullable<ReturnType<typeof useBoard.getState>["view"]> }) {
  const { agents, openInitiative } = useBoard();
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const all = view.board.initiatives ?? [];
  const folded = inactiveIds(view);
  const ids = uniq(all.map((i) => i.id)).filter((id) => !folded.has(id));
  const cols = view.board.columns ?? {};
  const states = initiativeStates(view, agents);
  const { ref, idWidth, narrow } = useFitIds(ids.join(" "));
  if (ids.length === 0) {
    return (
      <div className="panel empty-state">
        <div>{folded.size > 0 ? "No active initiatives." : "No initiatives found."}</div>
        <div className="sub">{folded.size > 0 ? "The rest sit under Not active at the bottom of the rail." : "Add a root that holds a working-on/initiative.yaml in Settings."}</div>
      </div>
    );
  }
  return (
    <div ref={ref} className={`panel port ${narrow ? "narrow" : ""}`} role="table" style={idWidth ? { "--id-w": `${idWidth}px` } as React.CSSProperties : undefined}>
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
              <Signals i={i} rows={rows} cards={cards} waves={group?.waves ?? []} cell={group?.cell} missing={missingPersonas(group?.crew)} />
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

/** The room the columns after the id need on one line: goal, stage and
 *  signals at their narrowest readable width, and the fixed columns (rank,
 *  state, phase, next date, chevron) with their gaps, as home.css sets them. */
const ONE_LINE_REST = 320 + 480;

/** FR-2 (lead-side-fixes): every id reads in full. The id column is as wide
 *  as the longest id; when that leaves too little for the rest on one line,
 *  the table goes narrow and phase, goal and next date move to the row's
 *  second line (home.css, .port.narrow). A ResizeObserver, not a media query:
 *  the room depends on the rail, and Safari 15 has no container queries. */
function useFitIds(key: string) {
  const ref = useRef<HTMLDivElement>(null);
  const [idWidth, setIdWidth] = useState(0);
  const [narrow, setNarrow] = useState(false);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fit = () => {
      const w = Math.max(0, ...Array.from(el.querySelectorAll<HTMLElement>(".p-row .p-id")).map((b) => b.scrollWidth));
      setIdWidth(Math.ceil(w));
      setNarrow(el.clientWidth < w + ONE_LINE_REST);
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [key]);
  return { ref, idWidth, narrow };
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

function Signals({ i, rows, cards, waves, cell, missing }: { i: merge.BoardInitiative; rows: merge.BoardInitiative[]; cards: merge.BoardCard[]; waves: service.Wave[]; cell?: model.Cell | null; missing: string[] }) {
  const waiting = waitingDecisions(i);
  const blocked = cards.filter((c) => c.status === "blocked").length;
  const now = cards.filter((c) => c.status === "now").length;
  const live = rows.reduce((a, r) => a + (r.live ?? 0), 0);
  const working = rows.reduce((a, r) => a + (r.working ?? 0), 0);
  const running = waves.filter((w) => (w.building?.length ?? 0) > 0);
  const problems = i.problems?.length ?? 0;
  const defining = cell?.state === "in_definition";
  const none = !waiting && !blocked && !now && !live && !running.length && !problems && !defining;
  return (
    <span className="p-sig">
      {waiting > 0 && <span className="lz waiting"><span className="num">{waiting}</span> waiting · {waitingOwners(i).join(", ")}</span>}
      {blocked > 0 && <span className="lz blocked"><span className="num">{blocked}</span> blocked</span>}
      {now > 0 && <span className="lz now"><span className="num">{now}</span> now</span>}
      {running.map((w) => <span key={w.n} className="lz live">wave <span className="num">{w.n}</span> · <span className="num">{w.building!.length}</span> building</span>)}
      {live > 0 && <span className="lz">{working > 0 ? <><span className="num">{working}</span> working</> : <><span className="num">{live}</span> live</>}</span>}
      <CellStateLz cell={cell} missing={missing} label="cell in definition" />
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
