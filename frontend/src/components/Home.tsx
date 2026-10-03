import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Briefcase, ChevronDown, ChevronRight, CircleDashed, Compass, Hammer, Hand, Play } from "lucide-react";
import type { merge, model, service } from "../../wailsjs/go/models";
import { inactiveIds, launchVerb, leadOf, missingPersonas, needsMeRows, type NeedsMeRow } from "../lib/queue";
import { initiativeStates, phaseWord, STATE_WORD, type InitiativeState } from "../lib/initiativeState";
import { uniq } from "../lib";
import { HEALTH, messages } from "../lib/health";
import { ownerPhrase, signalOwners, waitingDecisions } from "../lib/decisions";
import { signalsThatFit, type WidthClass } from "../lib/width";
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
 *  unmounts nothing. Wide puts Needs me in a right column of its own. */
export function Home() {
  const { view, agents, widthClass, roomy, ruleDraft, dropRule } = useBoard();
  const home = useRef<HTMLDivElement>(null);
  const rows = view ? needsMeRows(view, agents) : [];
  // A ruled record leaves the queue, and its box and its draft with it.
  const gone = !!ruleDraft && !!view && !rows.some((r) => r.key === ruleDraft.key) ? ruleDraft.key : null;
  useEffect(() => { if (gone) dropRule(gone); }, [gone, dropRule]);
  useKeepScroll(home, widthClass, !!view);
  if (!view) return <div className="empty">Loading…</div>;
  return (
    <div ref={home} className={`home ${widthClass} ${roomy ? "roomy" : ""}`}>
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
  const { ruleDraft, openRule, setRuleDraft, dropRule, widthClass } = useBoard();
  const open = ruleDraft?.key === rowKey;
  const btn = useRef<HTMLButtonElement>(null);
  // Compact's sheet covers Home, and regular's box covers the rows under its
  // opener: a scrim goes over what it covers, the rows' verbs behind it (FR-8,
  // FR-17). Wide's box sits in the column's flow and covers nothing. A click
  // on the scrim closes the box and keeps the words, as Escape does.
  const closeKeep = () => { openRule(null); btn.current?.focus(); };
  return (
    <span className="rb-anchor">
      {open && widthClass !== "wide" && <div className="rb-scrim" aria-hidden="true" onClick={closeKeep} />}
      <button ref={btn} className="act" aria-expanded={open} aria-label={`Rule ${initiative} ${decision.number}`} onClick={() => openRule(open ? null : rowKey)}>Rule</button>
      {open && <RuleDecisionBox initiative={initiative} decision={decision} withRecord opener={btn} afterRule={focusNeedsMe} onClose={() => openRule(null)} onCancel={() => dropRule(rowKey)}
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
  const { agents, openInitiative, widthClass } = useBoard();
  const compact = widthClass === "compact";
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
    <div ref={ref} className={`panel port ${narrow && !compact ? "narrow" : ""}`} role="table" style={idWidth ? { "--id-w": `${idWidth}px` } as React.CSSProperties : undefined}>
      <div className="p-head" role="row">
        <span className="num">#</span><span>initiative</span><span>state</span><span>phase</span><span>goal</span><span>stage</span><span>signals</span><span>next date</span><span />
      </div>
      {ids.map((id, k) => {
        const rows = all.filter((i) => i.id === id);
        const i = rows.find((r) => r.local) ?? rows[0];
        const cards = (["now", "blocked", "next"] as const).flatMap((st) => (cols[st] ?? []).filter((c) => c.initiative_id === id));
        const group = agents?.groups?.find((g) => g.id === id);
        const next = nextDate(i, cards);
        return (
          <div key={id} className="p-item" data-id={id}>
            <div className="p-row" role="row">
              <span className="p-rank num">{k + 1}</span>
              <button className="p-id" onClick={() => openInitiative(id, "overview")} title={compact ? idHover(i, next) : i.title}>{id}</button>
              <StateLz state={states.get(id) ?? "quiet"} />
              <Phase stages={i.stages ?? []} />
              <span title={i.goal || undefined} className={`p-goal ${i.goal ? "" : "missing"}`}>{i.goal || "no goal yet"}</span>
              <MiniStepper stages={i.stages ?? []} compact={compact} />
              <Signals i={i} rows={rows} cards={cards} waves={group?.waves ?? []} cell={group?.cell} missing={missingPersonas(group?.crew)} lead={leadOf(group)}  />
              <NextDate next={next} />
              <button className="p-more ghost" onClick={() => setOpen({ ...open, [id]: !open[id] })} aria-expanded={!!open[id]} aria-label={detailsName(id)} title={detailsName(id)}>
                {open[id] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>
            </div>
            {open[id] && <div className="p-detail"><GoalAndDate i={i} next={next} /><InitiativeDetail i={i} /></div>}
          </div>
        );
      })}
    </div>
  );
}

type Next = ReturnType<typeof nextDate>;

/** The chevron's name and hover (FR-11): what its detail opens on. */
const detailsName = (id: string) => `Details for ${id}: goal, next date, repos`;

/** Compact's id hover (responsive-home FR-2): the title, then the goal and
 *  the next date that left the row. */
const idHover = (i: merge.BoardInitiative, next: Next) =>
  `${i.title}\ngoal: ${i.goal || "no goal yet"}\nnext date: ${next ? `${next.date} ${next.what}` : "none ahead"}`;

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

/** A row's signals. Each lozenge's words sit in a text span that takes the
 *  ellipsis (FR-14): the lozenge is a flex box, and a flex box clips its
 *  text mid-word instead of cutting it. */
function Signals({ i, rows, cards, waves, cell, missing, lead }: { i: merge.BoardInitiative; rows: merge.BoardInitiative[]; cards: merge.BoardCard[]; waves: service.Wave[]; cell?: model.Cell | null; missing: string[]; lead: string }) {
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
    <OneLine>
      {waiting > 0 && <span className="lz waiting"><span className="lz-t"><span className="num">{waiting}</span> waiting · {signalOwners(i, lead).join(", ")}</span></span>}
      {blocked > 0 && <span className="lz blocked"><span className="lz-t"><span className="num">{blocked}</span> blocked</span></span>}
      {now > 0 && <span className="lz now"><span className="lz-t"><span className="num">{now}</span> now</span></span>}
      {running.map((w) => <span key={w.n} className="lz live"><span className="lz-t">wave <span className="num">{w.n}</span> · <span className="num">{w.building!.length}</span> building</span></span>)}
      {live > 0 && <span className="lz"><span className="lz-t">{working > 0 ? <><span className="num">{working}</span> working</> : <><span className="num">{live}</span> live</>}</span></span>}
      <CellStateLz cell={cell} missing={missing} label="cell in definition" />
      {problems > 0 && <span className="lz warning"><span className="lz-t"><span className="num">{problems}</span> problem{problems === 1 ? "" : "s"}</span></span>}
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
function OneLine({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [cut, setCut] = useState<{ n: number; rest: string[]; whole: string } | null>(null);
  const measure = () => {
    const el = ref.current;
    if (!el) return;
    const items = Array.from(el.children).filter((c): c is HTMLElement => c instanceof HTMLElement && !c.classList.contains("sig-more") && !c.classList.contains("sr-only"));
    // Hidden ones are shown for the measure, inside this frame.
    for (const c of items) c.style.display = "inline-flex";
    const more = el.querySelector<HTMLElement>(".sig-more");
    const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
    // A lozenge's natural width: a shrunk one hides the rest in its text
    // span (FR-14), not in its own overflow.
    const natural = (c: HTMLElement) => {
      const t = c.querySelector<HTMLElement>(".lz-t");
      return Math.max(c.getBoundingClientRect().width + (t ? t.scrollWidth - t.clientWidth : 0), c.scrollWidth);
    };
    const n = signalsThatFit(items.map(natural), gap, el.clientWidth, Math.max(more?.getBoundingClientRect().width ?? 0, 28));
    const rest = items.slice(n).map((c) => (c.textContent ?? "").replace(/\s+/g, " ").trim());
    items.forEach((c, k) => { c.style.display = ""; if (k >= n) c.dataset.off = "1"; else delete c.dataset.off; });
    // A shown signal may still be cut by its ellipsis (the first one when
    // the cell is tight, any one at the lozenge's cap): then the hover names
    // it whole.
    const whole = items.slice(0, n).filter((c) => {
      const t = c.querySelector<HTMLElement>(".lz-t") ?? c;
      return t.scrollWidth > t.clientWidth + 1;
    }).map((c) => (c.textContent ?? "").replace(/\s+/g, " ").trim()).join("\n");
    setCut((p) => (p && p.n === n && p.whole === whole && p.rest.join("|") === rest.join("|") ? p : { n, rest, whole }));
  };
  useLayoutEffect(measure);
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
