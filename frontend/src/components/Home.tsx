import { createContext, useContext, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Briefcase, ChevronDown, ChevronRight, CircleDashed, Compass, Hammer, Hand, Play } from "lucide-react";
import type { merge, model, service } from "../../wailsjs/go/models";
import { inactiveIds, launchVerb, leadOf, missingPersonas, needsMeRows, type NeedsMeRow } from "../lib/queue";
import { initiativeStates, phaseWord, STATE_WORD, type InitiativeState } from "../lib/initiativeState";
import { uniq } from "../lib";
import { HEALTH, messages } from "../lib/health";
import { ownerPhrase, signalOwners, waitingDecisions } from "../lib/decisions";
import { compactColumns, FOLD, GOAL_CHARS, GOAL_FLOOR_CHARS, goalFloor, homeClassOf, NO_EMPTY, shareRoom, signalsNeed, signalsShown, wideGoalRoom, type Empty, type Fold, type WidthClass } from "../lib/width";
import { useBoard } from "../stores/board.store";
import { nextDate, stageState } from "./InitiativeHeader";
import { InitiativeDetail } from "./Initiatives";
import { RuleDecisionBox } from "./RuleDecisionBox";
import { CellStateLz, IN_DEFINITION_WAITS } from "./Crew";
import "../styles/home.css";

/** Home: what needs me, and where every initiative stands (FR-15, FR-16).
 *  Needs me is one list, oldest first, one verb per row; its length is the
 *  top bar's one badge. Below it, the active initiatives in the rail's order;
 *  the rest sit in the rail's Not active group (FR-9).
 *  The window's width class (responsive-home) is a class on .home and
 *  nothing else: the tree is the same in every class, so crossing one
 *  unmounts nothing. Wide puts Needs me in a right column of its own, and
 *  only while the list beside it keeps about 70 characters of goal (FR-21):
 *  Home's class is the window's, measured on the row. */
export function Home() {
  const { view, agents, widthClass: windowClass, roomy: windowRoomy, ruleDraft, dropRule } = useBoard();
  const home = useRef<HTMLDivElement>(null);
  const { cls: widthClass, goalMin } = useHomeClass(home, windowClass, view);
  // A window wide enough for wide that Home measures too tight for it is
  // regular at its top, so the cap lifts as regular's does from 1720.
  const roomy = windowRoomy || (windowClass === "wide" && widthClass === "regular");
  const rows = view ? needsMeRows(view, agents) : [];
  // A ruled record leaves the queue, and its box and its draft with it.
  const gone = !!ruleDraft && !!view && !rows.some((r) => r.key === ruleDraft.key) ? ruleDraft.key : null;
  useEffect(() => { if (gone) dropRule(gone); }, [gone, dropRule]);
  useKeepScroll(home, widthClass, !!view);
  if (!view) return <div className="empty">Loading…</div>;
  return (
    <HomeClass.Provider value={widthClass}>
    <div ref={home} className={`home ${widthClass} ${roomy ? "roomy" : ""}`} style={widthClass === "wide" ? { "--goal-min": `${goalMin}px` } as React.CSSProperties : undefined}>
      <section className="home-sec home-needs">
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
      <section className="home-sec home-list">
        <h2 className="sec-title">Initiatives <span className="sec-sub">by priority</span></h2>
        <Initiatives view={view} />
      </section>
    </div>
    </HomeClass.Provider>
  );
}

/** Home's width class, which the rule box and the rows read in place of the
 *  window's (FR-21). */
const HomeClass = createContext<WidthClass>("regular");

/** FR-21: a window in the wide class is wide on Home only while the goal
 *  column beside Needs me keeps each goal's first 70 characters, or the
 *  whole goal when it is shorter (lib/width.ts, homeClassOf), with the rail
 *  expanded or collapsed. Measured on the rows after layout and again when
 *  the room changes (the window, the rail); the goal's need is measured on
 *  the goal's own font. `goalMin` is wide's least goal column, so the grid
 *  gives the goal its need before stage and signals grow. */
function useHomeClass(home: React.RefObject<HTMLDivElement | null>, windowClass: WidthClass, view: unknown) {
  const [state, setState] = useState<{ cls: WidthClass; goalMin: number }>({ cls: windowClass, goalMin: 0 });
  const was = useRef(state.cls);
  was.current = state.cls;
  useLayoutEffect(() => {
    const el = home.current;
    const wrap = el?.parentElement;
    const set = (cls: WidthClass, goalMin = 0) => setState((p) => (p.cls === cls && p.goalMin === goalMin ? p : { cls, goalMin }));
    if (windowClass !== "wide" || !el || !wrap) { set(windowClass); return; }
    const measure = () => {
      const port = el.querySelector<HTMLElement>(".port");
      const row = el.querySelector<HTMLElement>(".p-row");
      if (!port || !row) { set(windowClass); return; }
      const wcs = getComputedStyle(wrap);
      const avail = wrap.clientWidth - parseFloat(wcs.paddingLeft) - parseFloat(wcs.paddingRight);
      const id = Math.ceil(Math.max(0, ...Array.from(el.querySelectorAll<HTMLElement>(".p-row .p-id")).map((b) => b.scrollWidth)));
      const gap = parseFloat(getComputedStyle(row).columnGap) || 0;
      const empty = { next: port.classList.contains("empty-next"), sig: port.classList.contains("empty-sig") };
      const need = goalNeed(Array.from(el.querySelectorAll<HTMLElement>(".p-row .p-goal")));
      const cls = homeClassOf(windowClass, was.current, avail, need, id, gap, empty);
      set(cls, cls === "wide" ? Math.max(160, Math.min(need, Math.floor(wideGoalRoom(avail, id, gap, empty)))) : 0);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [home, windowClass, view]);
  return state;
}

/** The goal column's need (FR-21): the widest of the goals' first
 *  GOAL_CHARS characters (with the ellipsis a cut one ends in), or of the
 *  whole goal when it is shorter, in the goal's own font. */
function goalNeed(goals: HTMLElement[]): number {
  const g = goals[0];
  const ctx = g ? document.createElement("canvas").getContext("2d") : null;
  if (!g || !ctx) return 0;
  const cs = getComputedStyle(g);
  ctx.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
  const text = (t: string) => (t.length > GOAL_CHARS ? `${t.slice(0, GOAL_CHARS)}…` : t);
  return Math.ceil(Math.max(0, ...goals.map((el) => ctx.measureText(text((el.textContent ?? "").trim())).width))) + 1;
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
 *  openNeedsMe names it. The row's hover carries its whole context line in
 *  every class (FR-11): wide cuts it, compact takes it out of the view and
 *  keeps it in the accessible text. */
function Shell({ row, reason, tone, subject, context, children }: { row: NeedsMeRow; reason: string; tone: string; subject: React.ReactNode; context: string; children: React.ReactNode }) {
  const { needsMeFocus, ruleDraft } = useBoard();
  const ref = useRef<HTMLDivElement>(null);
  const focused = needsMeFocus === row.key;
  useEffect(() => { if (focused) ref.current?.scrollIntoView({ block: "center", behavior: "smooth" }); }, [focused]);
  return (
    <div ref={ref} className={`ib-row ${focused ? "focused" : ""} ${ruleDraft?.key === row.key ? "ruling" : ""}`} data-key={row.key} title={context}>
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
      context={`${ownerPhrase(d.owner)} · raised ${d.raised || "—"}${d.raised_by ? ` by ${d.raised_by}` : ""}${opts.length > 0 ? ` · options: ${opts.join(", ")}` : ""}`}>
      <RuleAction rowKey={row.key} initiative={row.initiative} decision={d} />
    </Shell>
  );
}

/** Rule on a Needs me row: a disclosure, so it stays marked while its box
 *  is open (aria-expanded and --surface-selected, ui-leftovers FR-4), and
 *  its name carries the record (FR-6). Focus comes back to it when the box
 *  closes; once the ruling lands the row is gone, and focus goes to the
 *  Needs me heading (FR-5). Which box is open and what is typed in it live
 *  in the store (ruleDraft), above the layout (responsive-home FR-5); one
 *  box is open at a time, and each record keeps its words until Rule or
 *  Cancel (FR-9): opening another row's Rule, Escape or this Rule again
 *  closes the box and keeps them. */
function RuleAction({ rowKey, initiative, decision }: { rowKey: string; initiative: string; decision: model.Decision }) {
  const { ruleDraft, openRule, setRuleDraft, dropRule } = useBoard();
  const widthClass = useContext(HomeClass);
  const open = ruleDraft?.key === rowKey;
  const btn = useRef<HTMLButtonElement>(null);
  // Compact's sheet covers Home, and regular's box covers the rows under its
  // opener: a scrim goes over what it covers, the rows' verbs behind it (FR-8,
  // FR-17). Wide's box sits in the column's flow and covers nothing. A click
  // on the scrim closes the box and keeps the words, as Escape does.
  const closeKeep = () => { openRule(null); btn.current?.focus(); };
  return (
    <span className="rb-anchor">
      {/* The scrim sits outside the row, on the page's ground, so the
          opener's row can stand above it (FR-23). */}
      {open && widthClass !== "wide" && createPortal(<div className="rb-scrim" aria-hidden="true" onClick={closeKeep} />, document.body)}
      <button ref={btn} className="act" aria-expanded={open} aria-label={`Rule ${initiative} ${decision.number}`} onClick={() => openRule(open ? null : rowKey)}>Rule</button>
      {open && <RuleDecisionBox initiative={initiative} decision={decision} withRecord widthClass={widthClass} opener={btn} afterRule={focusNeedsMe} onClose={() => openRule(null)} onCancel={() => dropRule(rowKey)}
        draft={{ chosen: ruleDraft.chosen, words: ruleDraft.words, set: setRuleDraft }} />}
    </span>
  );
}

const NEEDS_ME_HEADING = "needs-me-heading";
const focusNeedsMe = () => document.getElementById(NEEDS_ME_HEADING)?.focus();

/** The initiatives by priority, one row each (H3): its state and phase
 *  (FR-6 of twenty-at-a-glance), goal or "no goal yet", a compact stage
 *  stepper, its signals and its next real date. A row opens
 *  the initiative; the chevron shows its goal, next date, repos, problems
 *  and actions in place. */
function Initiatives({ view }: { view: NonNullable<ReturnType<typeof useBoard.getState>["view"]> }) {
  const { agents, openInitiative } = useBoard();
  const compact = useContext(HomeClass) === "compact";
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const all = view.board.initiatives ?? [];
  const folded = inactiveIds(view);
  const ids = uniq(all.map((i) => i.id)).filter((id) => !folded.has(id));
  const cols = view.board.columns ?? {};
  const states = initiativeStates(view, agents);
  const items = ids.map((id) => {
    const rows = all.filter((i) => i.id === id);
    const i = rows.find((r) => r.local) ?? rows[0];
    const cards = (["now", "blocked", "next"] as const).flatMap((st) => (cols[st] ?? []).filter((c) => c.initiative_id === id));
    const group = agents?.groups?.find((g) => g.id === id);
    const sig = signalFacts(i, rows, cards, group?.waves ?? [], group?.cell);
    return { id, rows, i, cards, group, sig, next: nextDate(i, cards) };
  });
  // FR-20: a column empty ("—") on every shown row gives way first.
  const empty: Empty = { next: items.length > 0 && items.every((r) => !r.next), sig: items.length > 0 && items.every((r) => r.sig.none) };
  const { ref, idWidth, narrow, fit, goalMin } = useFitIds(ids.join(" "), empty);
  const [sigFloor, reportSig] = useSigFloor();
  // Compact's row is one line; its goal and next date give way only when the
  // row has no room for them (FR-16), and come back when it has.
  const hides = { goal: compact && !fit.goal, next: compact && !fit.next && !empty.next };
  if (ids.length === 0) {
    return (
      <div className="panel empty-state">
        <div>{folded.size > 0 ? "No active initiatives." : "No initiatives found."}</div>
        <div className="sub">{folded.size > 0 ? "The rest sit under Not active at the bottom of the rail." : "Add a root that holds a working-on/initiative.yaml in Settings."}</div>
      </div>
    );
  }
  return (
    <div ref={ref} className={`panel port ${narrow && !compact ? "narrow" : ""} ${hides.goal ? "" : "fit-goal"} ${hides.next || empty.next ? "" : "fit-next"} ${empty.next ? "empty-next" : ""} ${empty.sig ? "empty-sig" : ""}`} role="table" style={{ ...(idWidth ? { "--id-w": `${idWidth}px` } : {}), ...(goalMin ? { "--goal-floor": `${goalMin}px` } : {}), ...(sigFloor ? { "--sig-floor": `${sigFloor}px` } : {}) } as React.CSSProperties}>
      <div className="p-head" role="row">
        <span className="num">#</span><span>initiative</span><span>state</span><span>phase</span><span>goal</span><span>stage</span><span>signals</span><span>next date</span><span />
      </div>
      <SigNeed.Provider value={reportSig}>
      {items.map(({ id, rows, i, group, sig, next }, k) => {
        return (
          <div key={id} className="p-item" data-id={id}>
            <div className="p-row" role="row">
              <span className="p-rank num">{k + 1}</span>
              <button className="p-id" onClick={() => openInitiative(id, "overview")} title={hides.goal || hides.next ? idHover(i, next, hides) : i.title}>{id}</button>
              <StateLz state={states.get(id) ?? "quiet"} />
              <Phase stages={i.stages ?? []} />
              <span title={i.goal || undefined} className={`p-goal ${i.goal ? "" : "missing"}`}>{i.goal || "no goal yet"}</span>
              <MiniStepper stages={i.stages ?? []} compact={compact} />
              <Signals i={i} sig={sig} cell={group?.cell} missing={missingPersonas(group?.crew)} lead={leadOf(group)} />
              <NextDate next={next} />
              <button className="p-more ghost" onClick={() => setOpen({ ...open, [id]: !open[id] })} aria-expanded={!!open[id]} aria-label={detailsName(id)} title={detailsName(id)}>
                {open[id] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>
            </div>
            {open[id] && <div className="p-detail"><GoalAndDate i={i} next={next} /><InitiativeDetail i={i} /></div>}
          </div>
        );
      })}
      </SigNeed.Provider>
    </div>
  );
}

type Next = ReturnType<typeof nextDate>;

/** The chevron's name and hover (FR-11): what its detail opens on. */
const detailsName = (id: string) => `Details for ${id}: goal, next date, repos`;

/** Compact's id hover (responsive-home FR-2, FR-16): the title, then the
 *  goal and the next date if they left the row. */
const idHover = (i: merge.BoardInitiative, next: Next, hides: { goal: boolean; next: boolean }) =>
  [i.title, hides.goal && `goal: ${i.goal || "no goal yet"}`, hides.next && `next date: ${next ? `${next.date} ${next.what}` : "none ahead"}`].filter(Boolean).join("\n");

/** The chevron's detail opens on the goal and the next date, whole: the
 *  ones compact's row no longer shows and the ones regular cuts (FR-11). */
function GoalAndDate({ i, next }: { i: merge.BoardInitiative; next: Next }) {
  return (
    <div className="p-detail-goal">
      <span className="init-detail-label">goal</span>
      <span className={i.goal ? "" : "missing"}>{i.goal || "no goal yet"}</span>
      <span className="init-detail-label">next date</span>
      {next ? <span><span className="num">{next.date}</span> <span className="p-next-what">{next.what}</span></span> : <span className="missing">none ahead</span>}
    </div>
  );
}

/** The room the columns after the id need on one line: goal, stage and
 *  signals at their narrowest readable width, and the fixed columns (rank,
 *  state, phase, next date, chevron) with their gaps, as home.css sets them. */
const ONE_LINE_REST = 320 + 480;
/** The next date's share of that (its 96 px column). */
const NEXT_REST = 96;

/** FR-2 (lead-side-fixes): every id reads in full. The id column is as wide
 *  as the longest id; when that leaves too little for the rest on one line,
 *  the table goes narrow and phase, goal and next date move to the row's
 *  second line (home.css, .port.narrow). Compact's rows stay one line, and
 *  `fit` says which of goal and next date the row has room for (FR-16). A
 *  ResizeObserver, not a media query: the room depends on the rail, and
 *  Safari 15 has no container queries. */
function useFitIds(key: string, empty: Empty = NO_EMPTY) {
  const ref = useRef<HTMLDivElement>(null);
  const [idWidth, setIdWidth] = useState(0);
  const [narrow, setNarrow] = useState(false);
  const [fit, setFit] = useState({ goal: true, next: true });
  const [goalMin, setGoalMin] = useState(0);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fit = () => {
      const w = Math.max(0, ...Array.from(el.querySelectorAll<HTMLElement>(".p-row .p-id")).map((b) => b.scrollWidth));
      setIdWidth(Math.ceil(w));
      const row = el.querySelector<HTMLElement>(".p-row");
      const cs = row ? getComputedStyle(row) : null;
      const pad = cs ? parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight) : 0;
      const gap = cs ? parseFloat(cs.columnGap) || 0 : 0;
      // An empty next date takes no room on the line (FR-20).
      setNarrow(el.clientWidth < w + ONE_LINE_REST - (empty.next ? NEXT_REST + gap : 0));
      // The goal's floor in rendered width (leftovers-5 FR-8): its first
      // 30 characters in the goal's own font, measured on the room the row
      // has, classic scrollbar and all.
      const floor = goalFloor(goalWidths(el));
      setGoalMin(floor);
      const f = compactColumns(el.clientWidth - pad, Math.ceil(w), gap, empty, floor);
      setFit((p) => (p.goal === f.goal && p.next === f.next ? p : f));
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [key, empty.next, empty.sig]);
  return { ref, idWidth, narrow, fit, goalMin };
}

/** The shown goals' first GOAL_FLOOR_CHARS characters (or the whole goal
 *  when shorter), measured in the goal's font. */
function goalWidths(el: HTMLElement): number[] {
  const goals = Array.from(el.querySelectorAll<HTMLElement>(".p-row .p-goal:not(.missing)"));
  if (goals.length === 0) return [];
  const ctx = document.createElement("canvas").getContext("2d");
  if (!ctx) return [];
  ctx.font = getComputedStyle(goals[0]).font;
  return goals.map((g) => ctx.measureText((g.textContent ?? "").trim().slice(0, GOAL_FLOOR_CHARS)).width);
}

/** Home's compact stepper: one segment per stage and the current one named.
 *  Fewer than three stages are words only (design system, Stage stepper).
 *  In the compact class the label is `n/m` (responsive-home FR-2); the
 *  stage's title moves to the hover and stays in the accessible text. */
function MiniStepper({ stages, compact = false }: { stages: model.Stage[]; compact?: boolean }) {
  if (stages.length === 0) return <span className="p-stage"><span className="stage-lbl missing">no roadmap</span></span>;
  const cur = stages.findIndex((s) => s.current);
  const label = cur >= 0 ? <><span className="num">{cur + 1}</span> · {stages[cur].title} · now</> : <>all <span className="num">{stages.length}</span> done</>;
  if (compact) {
    const full = cur >= 0 ? `stage ${cur + 1} of ${stages.length} · ${stages[cur].title} · now` : `all ${stages.length} stages done`;
    return (
      <span className="p-stage" title={full}>
        {stages.length >= 3 && <span className="stepper" aria-hidden="true">{stages.map((s, k) => <i key={k} className={stageState(s)} />)}</span>}
        <span className="stage-lbl num" aria-hidden="true">{cur >= 0 ? `${cur + 1}/${stages.length}` : `${stages.length}/${stages.length}`}</span>
        <span className="sr-only">{full}</span>
      </span>
    );
  }
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

type SignalFacts = ReturnType<typeof signalFacts>;

/** Each row's OneLine reports what its signals need (signalsNeed); the
 *  table gives regular's and wide's signal column the widest (--sig-floor). */
const SigNeed = createContext<(id: string, px: number) => void>(() => {});

/** The widest row's signal need, as rows report it. State changes only
 *  when the widest changes, so a row's report does not loop: the need is
 *  measured with every cap lifted, whatever the column's width. */
function useSigFloor(): [number, (id: string, px: number) => void] {
  const needs = useRef(new Map<string, number>());
  const [floor, setFloor] = useState(0);
  const report = useRef((id: string, px: number) => {
    if (needs.current.get(id) === px) return;
    needs.current.set(id, px);
    const max = Math.ceil(Math.max(0, ...needs.current.values()));
    setFloor((p) => (p === max ? p : max));
  }).current;
  return [floor, report];
}

/** What a row's signals count, apart from how they are drawn: Home asks
 *  whether the column is empty on every row (FR-20) before it draws one. */
function signalFacts(i: merge.BoardInitiative, rows: merge.BoardInitiative[], cards: merge.BoardCard[], waves: service.Wave[], cell?: model.Cell | null) {
  const waiting = waitingDecisions(i);
  const blocked = cards.filter((c) => c.status === "blocked").length;
  const now = cards.filter((c) => c.status === "now").length;
  const live = rows.reduce((a, r) => a + (r.live ?? 0), 0);
  const working = rows.reduce((a, r) => a + (r.working ?? 0), 0);
  const running = waves.filter((w) => (w.building?.length ?? 0) > 0);
  const problems = i.problems?.length ?? 0;
  const defining = cell?.state === "in_definition";
  const none = !waiting && !blocked && !now && !live && !running.length && !problems && !defining;
  return { waiting, blocked, now, live, working, running, problems, none };
}

/** A row's signals. Each lozenge's words sit in a text span that takes the
 *  ellipsis (FR-14): the lozenge is a flex box, and a flex box clips its
 *  text mid-word instead of cutting it. `data-fold` is how soon a signal
 *  folds into "+N" (FR-20); one without it never folds. */
function Signals({ i, sig, cell, missing, lead }: { i: merge.BoardInitiative; sig: SignalFacts; cell?: model.Cell | null; missing: string[]; lead: string }) {
  const { waiting, blocked, now, live, working, running, problems, none } = sig;
  return (
    <OneLine id={i.id}>
      {waiting > 0 && <span className="lz waiting"><span className="lz-t"><span className="lz-floor"><span className="num">{waiting}</span> waiting</span> · {signalOwners(i, lead).join(", ")}</span></span>}
      {blocked > 0 && <span className="lz blocked"><span className="lz-t"><span className="num">{blocked}</span> blocked</span></span>}
      {now > 0 && <span className="lz now" data-fold={FOLD.now}><span className="lz-t"><span className="num">{now}</span> now</span></span>}
      {running.map((w) => <span key={w.n} className="lz live" data-fold={FOLD.live}><span className="lz-t">wave <span className="num">{w.n}</span> · <span className="num">{w.building!.length}</span> building</span></span>)}
      {live > 0 && <span className="lz" data-fold={FOLD.live}><span className="lz-t">{working > 0 ? <><span className="num">{working}</span> working</> : <><span className="num">{live}</span> live</>}</span></span>}
      <CellStateLz cell={cell} missing={missing} label="cell in definition" fold={FOLD.cell} />
      {problems > 0 && <span className="lz warning" data-fold={FOLD.problems}><span className="lz-t"><span className="num">{problems}</span> problem{problems === 1 ? "" : "s"}</span></span>}
      {none && <span className="p-quiet" title="no signals">—</span>}
    </OneLine>
  );
}

/** A row's signals in every class (FR-10, FR-15): one line, never
 *  wrapped. The lozenges that do
 *  not fit are hidden and counted in a "+N"; they are named in the cell's
 *  hover and in its accessible text. Measured after every render, since a
 *  signal changes with the 10 s agents feed and the room with the rail;
 *  state is set only when what fits changes. */
function OneLine({ id, children }: { id: string; children: React.ReactNode }) {
  const ref = useRef<HTMLSpanElement>(null);
  const reportNeed = useContext(SigNeed);
  const [cut, setCut] = useState<{ rest: string[]; whole: string } | null>(null);
  const measure = () => {
    const el = ref.current;
    if (!el) return;
    const items = Array.from(el.children).filter((c): c is HTMLElement => c instanceof HTMLElement && !c.classList.contains("sig-more") && !c.classList.contains("sr-only"));
    // Hidden ones are shown for the measure, inside this frame, and every
    // cap from the last measure is lifted.
    for (const c of items) { c.style.display = "inline-flex"; c.style.maxWidth = ""; }
    const more = el.querySelector<HTMLElement>(".sig-more");
    const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
    // A lozenge's natural width: a shrunk one hides the rest in its text
    // span (FR-14), not in its own overflow.
    const natural = (c: HTMLElement) => {
      const t = c.querySelector<HTMLElement>(".lz-t");
      return Math.max(c.getBoundingClientRect().width + (t ? t.scrollWidth - t.clientWidth : 0), c.scrollWidth);
    };
    const folds = items.map((c): Fold => (c.dataset.fold === undefined ? null : (Number(c.dataset.fold) as Fold)));
    // Each lozenge's floor in rendered width (leftovers-5 FR-8): one that
    // never folds keeps its N and whole noun (.lz-floor, "5 waiting") and
    // the ellipsis after it; a foldable one stays whole or folds.
    const nat = items.map(natural);
    const ell = ellipsisWidth(el);
    const floors = items.map((c, k) => {
      const t = c.querySelector<HTMLElement>(".lz-t");
      const f = c.querySelector<HTMLElement>(".lz-floor");
      if (folds[k] !== null || !t || !f) return nat[k];
      return Math.min(nat[k], Math.ceil(nat[k] - t.scrollWidth + f.getBoundingClientRect().width + ell));
    });
    const moreW = Math.max(more?.getBoundingClientRect().width ?? 0, 28);
    reportNeed(id, signalsNeed(floors, folds, gap, moreW));
    const shown = signalsShown(floors, folds, gap, el.clientWidth, moreW);
    const words = (c: HTMLElement) => (c.textContent ?? "").replace(/\s+/g, " ").trim();
    const rest = items.filter((_, k) => !shown[k]).map(words);
    items.forEach((c, k) => { c.style.display = ""; if (!shown[k]) c.dataset.off = "1"; else delete c.dataset.off; });
    // The shown ones share what the "+N" leaves (FR-20): each capped at one
    // width, never under its floor while the floors fit.
    const on = items.map((_, k) => k).filter((k) => shown[k]);
    const room = el.clientWidth - gap * Math.max(0, on.length - 1) - (rest.length > 0 ? gap + moreW : 0);
    const share = shareRoom(on.map((k) => nat[k]), on.map((k) => floors[k]), room);
    on.forEach((k, j) => { if (share.widths[j] < nat[k]) items[k].style.maxWidth = `${share.widths[j]}px`; });
    // A shown signal may still be cut by its ellipsis (the first one when
    // the cell is tight, any one at the lozenge's cap): then the hover names
    // it whole.
    const whole = items.filter((_, k) => shown[k]).filter((c) => {
      const t = c.querySelector<HTMLElement>(".lz-t") ?? c;
      return t.scrollWidth > t.clientWidth + 1;
    }).map((c) => (c.textContent ?? "").replace(/\s+/g, " ").trim()).join("\n");
    setCut((p) => (p && p.whole === whole && p.rest.join("|") === rest.join("|") ? p : { rest, whole }));
  };
  useLayoutEffect(measure);
  // A row that leaves the table needs nothing.
  useEffect(() => () => reportNeed(id, 0), [id, reportNeed]);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => measure());
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const rest = cut?.rest ?? [];
  const also = rest.length > 0 ? `and ${rest.length} more: ${rest.join(", ")}` : undefined;
  return (
    <span ref={ref} className="p-sig one-line" title={[cut?.whole, also].filter(Boolean).join("\n") || undefined}>
      {children}
      {rest.length > 0 && <span className="lz sig-more" aria-hidden="true">+{rest.length}</span>}
      {also && <span className="sr-only">{also}</span>}
    </span>
  );
}

/** The ellipsis' width in a lozenge's text font, measured once per font. */
const ellipses = new Map<string, number>();
function ellipsisWidth(el: HTMLElement): number {
  const t = el.querySelector<HTMLElement>(".lz-t");
  if (!t) return 0;
  const font = getComputedStyle(t).font;
  let w = ellipses.get(font);
  if (w === undefined) {
    const ctx = document.createElement("canvas").getContext("2d");
    if (ctx) ctx.font = font;
    w = ctx ? Math.ceil(ctx.measureText("…").width) : 0;
    ellipses.set(font, w);
  }
  return w;
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

function NextDate({ next: n }: { next: Next }) {
  if (!n) return <span className="p-next"><span className="num" title="no card due, milestone or target ahead">—</span></span>;
  return (
    <span className="p-next">
      <span className="num">{n.date}</span>
      <span className="p-next-what">{n.what}</span>
    </span>
  );
}

/** FR-5: crossing a width class keeps each column's scroll. The list keeps
 *  the initiative row that was at the top of the view, at the same offset
 *  (Needs me moves above or beside it, so a raw scrollTop would not); a
 *  page at its top stays at its top. Wide's Needs me column keeps its own
 *  scrollTop, which it loses while it is not a scroller. Safari 15 has no
 *  scroll anchoring, so this is done by hand. It also gives wide's column
 *  its height. */
function useKeepScroll(home: React.RefObject<HTMLDivElement | null>, widthClass: WidthClass, ready: boolean) {
  const mark = useRef({ atTop: true, id: null as string | null, offset: 0, needs: 0 });
  useEffect(() => {
    const el = home.current;
    const wrap = el?.parentElement;
    const needs = el?.querySelector<HTMLElement>(".home-needs");
    if (!el || !wrap || !needs) return;
    const onPage = () => {
      const top = wrap.getBoundingClientRect().top;
      const first = Array.from(el.querySelectorAll<HTMLElement>(".p-item")).find((p) => p.getBoundingClientRect().bottom > top);
      mark.current = { ...mark.current, atTop: wrap.scrollTop === 0, id: first?.dataset.id ?? null, offset: first ? first.getBoundingClientRect().top - top : 0 };
    };
    const onNeeds = () => { if (needs.scrollHeight > needs.clientHeight && getComputedStyle(needs).overflowY !== "visible") mark.current.needs = needs.scrollTop; };
    // Wide's Needs me column is as tall as the page's view (shell.css, --wrap-h).
    const tall = () => el.style.setProperty("--wrap-h", `${wrap.clientHeight}px`);
    tall();
    const ro = new ResizeObserver(tall);
    ro.observe(wrap);
    wrap.addEventListener("scroll", onPage);
    needs.addEventListener("scroll", onNeeds);
    return () => { ro.disconnect(); wrap.removeEventListener("scroll", onPage); needs.removeEventListener("scroll", onNeeds); };
  }, [home, ready]);
  const last = useRef(widthClass);
  useLayoutEffect(() => {
    if (last.current === widthClass) return;
    last.current = widthClass;
    const el = home.current;
    const wrap = el?.parentElement;
    if (!el || !wrap) return;
    const m = { ...mark.current };
    const needs = el.querySelector<HTMLElement>(".home-needs");
    // Over the next frames: the rule box re-enters the column's flow and takes
    // its height on its own re-renders, and until then the column may be too
    // short to reach the old position.
    if (widthClass === "wide" && needs) {
      const restore = (tries: number) => requestAnimationFrame(() => {
        needs.scrollTop = m.needs;
        if (needs.scrollTop < m.needs && tries > 0) restore(tries - 1);
      });
      restore(10);
    }
    if (m.atTop) { wrap.scrollTop = 0; return; }
    const row = m.id ? el.querySelector<HTMLElement>(`.p-item[data-id="${CSS.escape(m.id)}"]`) : null;
    if (row) wrap.scrollTop += row.getBoundingClientRect().top - wrap.getBoundingClientRect().top - m.offset;
  }, [home, widthClass]);
}
