import { useEffect, useMemo, useRef, useState } from "react";
import { marked } from "marked";
import type { merge, model } from "../../wailsjs/go/models";
import { DAY, daysBetween, parseISO, shortDate, today } from "../lib/dates";
import { addLocalDays } from "../lib/axis";
import { ownerPhrase } from "../lib/decisions";
import { readOnlyOf } from "../lib/queue";
import { useBoard } from "../stores/board.store";
import { RuleDecisionBox } from "./RuleDecisionBox";
import { EdgePointer, TimeFrame, ZoomControl, useTimeZoom } from "./TimeZoom";
import "../styles/decisions.css";

type Row = { d: model.Decision; initiative: string; machine: string; key: string };

const LABEL: Record<string, string> = { proposed: "waiting", ruled: "ruled", superseded: "superseded", withdrawn: "withdrawn" };

const median = (xs: number[]) => {
  if (xs.length === 0) return null;
  const s = [...xs].sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
};

/** The decisions tab: working-on/decisions/ records across initiatives, or
 *  the one selected in the rail. What waits on a ruling, how long rulings
 *  take, and the history from raised to ruled. Any proposed record can be
 *  ruled from its expanded row with Needs me's box, whoever owns it, and the
 *  ruling is signed by the ruler (FR-12, FR-14, 0045); everything else is
 *  read-only. Needs me still lists only the lead's records (0034). */
export function DecisionsView() {
  const { view, selectedInitiative, select, decisionFocus, decisionSeq } = useBoard();
  const [expanded, setExpanded] = useState<string | null>(decisionFocus);
  const [ruling, setRuling] = useState<string | null>(null);
  const focusRef = useRef<HTMLDivElement | null>(null);
  const landing = useRef(false);
  // openDecision lands here with its record expanded, scrolled to and
  // highlighted, as a Needs me key lands on Home (lead-side-fixes FR-6).
  useEffect(() => {
    if (!decisionFocus) return;
    setExpanded(decisionFocus);
    setRuling(null);
    landing.current = true;
    // decisionSeq: the chip pressed again on Decisions lands again (FR-2).
  }, [decisionFocus, decisionSeq]);
  // The scroll waits for the render that expanded the record. The record's
  // line goes to the top of the sub-view's scroller, under the header and
  // tabs, so its Rule and the question's first lines show even when the
  // record is taller than the view (header-fold U8); "Waiting on a ruling"
  // stays above it when the line still sits in the view's top half (U9).
  // The scroller is set directly: scrollIntoView also scrolls the clipped
  // ancestors, which pushed the header and the line above the window.
  useEffect(() => {
    const el = focusRef.current;
    if (!landing.current || !el || expanded !== decisionFocus) return;
    landing.current = false;
    const wrap = el.closest<HTMLElement>(".board-wrap");
    if (wrap) {
      const base = wrap.getBoundingClientRect().top - wrap.scrollTop;
      const at = (n: Element) => n.getBoundingClientRect().top - base - (parseFloat(getComputedStyle(n).scrollMarginTop) || 0);
      const section = el.closest(".dec-section");
      const top = section && at(el) - at(section) <= wrap.clientHeight / 2 ? at(section) : at(el);
      wrap.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
    }
    // Focus and names, navigating (ui-leftovers FR-5): focus lands on the
    // record's row, never on the page body.
    el.querySelector<HTMLButtonElement>("button.dec-line")?.focus({ preventScroll: true });
  });
  const ruleBtn = useRef<HTMLButtonElement | null>(null);
  const [showClosed, setShowClosed] = useState(false);
  const now = today();

  const rows = useMemo<Row[]>(() => {
    if (!view) return [];
    // An initiative on two machines reports its records twice; the local
    // scan is the fresher, so it wins.
    const seen = new Set<string>();
    const inits = [...(view.board.initiatives ?? [])].sort((a, b) => Number(b.local) - Number(a.local));
    const out: Row[] = [];
    for (const i of inits) {
      if (selectedInitiative && i.id !== selectedInitiative) continue;
      if (seen.has(i.id)) continue;
      seen.add(i.id);
      for (const d of i.decisions ?? []) out.push({ d, initiative: i.id, machine: i.machine, key: `${i.id}/${d.number}` });
    }
    return out;
  }, [view, selectedInitiative]);

  // Timeline: one row per decision, raised → ruled, open ones running to the
  // end of today. Records carry whole days, so the zoom stops at Days (A12);
  // each date covers its day.
  const shown = [...rows].filter((r) => showClosed || (r.d.status !== "superseded" && r.d.status !== "withdrawn")).sort((a, b) => a.d.raised.localeCompare(b.d.raised) || a.d.number.localeCompare(b.d.number));
  const marks = [now, ...shown.flatMap((r) => [parseISO(r.d.raised), parseISO(r.d.ruled)]).filter((d): d is Date => !!d)].map((d) => d.getTime());
  const dataFrom = Math.min(...marks);
  const dataTo = addLocalDays(Math.max(...marks), 1);
  const span = Math.max((dataTo - dataFrom) / DAY, 14);
  const fit = { from: addLocalDays(dataFrom, -Math.max(1, Math.round(span * 0.04))), to: addLocalDays(dataTo, Math.max(2, Math.round(span * 0.08))) };
  const z = useTimeZoom({ fit, data: { from: dataFrom, to: Math.max(dataTo, Date.now()) }, hours: false, reset: selectedInitiative });

  if (!view) return <div className="empty">Loading…</div>;

  const cardOf = (initiative: string, slug: string): merge.BoardCard | undefined =>
    Object.values(view.board.columns ?? {}).flat().find((c) => c.initiative_id === initiative && c.slug === slug);

  const open = rows.filter((r) => r.d.status === "proposed").sort((a, b) => a.d.raised.localeCompare(b.d.raised));
  const ruled = rows.filter((r) => r.d.status === "ruled").sort((a, b) => (b.d.ruled ?? "").localeCompare(a.d.ruled ?? ""));
  const closed = rows.filter((r) => r.d.status === "superseded" || r.d.status === "withdrawn");
  const age = (d: model.Decision) => { const r = parseISO(d.raised); return r ? daysBetween(r, now) : 0; };
  const turnaround = (d: model.Decision) => { const a = parseISO(d.raised), b = parseISO(d.ruled); return a && b ? daysBetween(a, b) : null; };
  const turnarounds = rows.map((r) => (r.d.status === "ruled" || r.d.status === "superseded" ? turnaround(r.d) : null)).filter((t): t is number => t !== null);
  const recent = ruled.filter((r) => { const d = parseISO(r.d.ruled); return !!d && daysBetween(d, now) <= 30; }).length;
  const oldest = open.length ? age(open[0].d) : null;
  const med = median(turnarounds);
  const all = !selectedInitiative;

  const head = (
    <div className="board-head">
      {!selectedInitiative && <h1>All initiatives</h1>}
      <span className="meta">decision records in working-on/decisions/ · anyone may rule a waiting record here, and it notes who did</span>
    </div>
  );
  if (rows.length === 0) {
    return (
      <div>
        {head}
        <div className="empty">No decision records{selectedInitiative ? " in this initiative" : ""} yet. The working-on skill says how to raise one.</div>
      </div>
    );
  }

  const toggle = (key: string) => { setExpanded(expanded === key ? null : key); setRuling(null); };

  // A render function, not a component: a component declared here would be a
  // new type on every store update (the agents feed, every 10 s) and remount,
  // dropping what was typed into the rule box.
  const record = (r: Row) => {
    const d = r.d;
    const isOpen = expanded === r.key;
    const t = turnaround(d);
    // FR-12, 0045: every proposed record offers Rule, whoever owns it.
    // FR-13: a record of an initiative that is not active offers none.
    const canRule = d.status === "proposed" && !readOnlyOf(view, r.initiative);
    const isRuling = canRule && ruling === r.key;
    const focused = decisionFocus === r.key;
    // The highlight is Home's focused row (shell.css .ib-row.focused), inline
    // because this card's boundary holds no stylesheet for .dec.
    return (
      <div key={r.key} data-dec={r.key} ref={focused ? focusRef : undefined} className={`dec ${d.status} ${isOpen ? "expanded" : ""} ${focused ? "focused" : ""}`} style={focused ? { background: "var(--surface-selected)" } : undefined}>
        <button className="dec-line" aria-expanded={isOpen} onClick={() => toggle(r.key)} title={isOpen ? "collapse" : "show the record"}>
          <span className="dec-num mono">{d.number}</span>
          <span className="dec-title">{d.title}</span>
          {all && <span className="badge">{r.initiative}</span>}
          <span className={`badge dec-status ${d.status}`}>{LABEL[d.status] ?? d.status}</span>
          <span className="dec-meta">
            {d.status === "proposed"
              ? <>{ownerPhrase(d.owner)} · <b>{age(d)}d</b> waiting</>
              : d.status === "ruled"
                ? <>{d.chosen ? <>“{d.chosen}” · </> : null}by {d.ruled_by || "—"} · {shortDate(parseISO(d.ruled) ?? now)}{t !== null && <> · {t}d</>}</>
                : d.superseded_by ? <>by {d.superseded_by}</> : null}
          </span>
        </button>
        {isOpen && (
          <div className="dec-body">
            <div className="dec-facts">
              <span>raised {d.raised} by {d.raised_by || "—"}</span>
              {d.options?.length ? <span>options: {d.options.join(" · ")}</span> : null}
              {(d.supersedes ?? []).length > 0 && <span>supersedes {d.supersedes.join(", ")}</span>}
              {(d.cards ?? []).map((slug) => {
                const c = cardOf(r.initiative, slug);
                return c
                  ? <button key={slug} className="link mono" onClick={() => select(c)}>{slug}</button>
                  : <span key={slug} className="mono dim">{slug}</span>;
              })}
            </div>
            {canRule && (
              <div className="dec-actions">
                <span className="rb-anchor">
                  <button ref={isRuling ? ruleBtn : undefined} className="primary" aria-expanded={isRuling} onClick={() => setRuling(isRuling ? null : r.key)}>Rule</button>
                  {isRuling && <RuleDecisionBox initiative={r.initiative} decision={d} opener={ruleBtn} afterRule={() => document.querySelector<HTMLButtonElement>(`[data-dec="${r.key}"] button.dec-line`)?.focus()} onClose={() => setRuling(null)} />}
                </span>
              </div>
            )}
            <div className="markdown dec-text" dangerouslySetInnerHTML={{ __html: marked.parse(d.body || "") as string }} />
            <div className="dec-path mono">{d.path}</div>
          </div>
        )}
      </div>
    );
  };

  const x = z.scale.x;
  const endOfDay = (d: Date) => addLocalDays(d.getTime(), 1);

  return (
    <div className="decisions">
      {head}

      <div className="dec-stats">
        <div className="dec-stat"><b className="waiting">{open.length}</b><span>waiting on a ruling</span></div>
        <div className="dec-stat"><b>{oldest === null ? "—" : `${oldest}d`}</b><span>oldest waiting</span></div>
        <div className="dec-stat"><b>{recent}</b><span>ruled in 30 days</span></div>
        <div className="dec-stat"><b>{med === null ? "—" : `${med}d`}</b><span>median turnaround</span></div>
      </div>

      <section className="dec-section">
        <h2>Waiting on a ruling <span className="meta">oldest first</span></h2>
        {open.length === 0 ? <div className="meta">Nothing waits on a ruling.</div> : open.map(record)}
      </section>

      <section className="dec-section">
        <div className="tz-head dec-tz-head">
          <h2>
            Timeline <span className="meta">raised → ruled; open ones run to today</span>
            {closed.length > 0 && (
              <button className="ghost small" onClick={() => setShowClosed(!showClosed)}>{showClosed ? "hide" : "show"} {closed.length} superseded or withdrawn</button>
            )}
          </h2>
          <ZoomControl z={z} />
        </div>
        <div className="gantt-body dec-timeline tz-host">
          <TimeFrame z={z} label="Decisions timeline" extents={shown.map((r) => {
            const raised = parseISO(r.d.raised) ?? now;
            const until = r.d.status === "proposed" ? now : parseISO(r.d.ruled) ?? raised;
            return { from: raised.getTime(), to: endOfDay(until < raised ? raised : until) };
          })}>
            {shown.map((r) => {
              const d = r.d;
              const raised = parseISO(d.raised) ?? now;
              const ruledAt = parseISO(d.ruled);
              let until = d.status === "proposed" ? now : ruledAt ?? raised;
              if (until < raised) until = raised;
              const dot = daysBetween(raised, until) < 1 && d.status !== "proposed";
              const from = raised.getTime();
              const to = endOfDay(until);
              const tip = `${d.number} ${d.title}\n${LABEL[d.status] ?? d.status} · raised ${d.raised}${d.ruled ? ` · ruled ${d.ruled} by ${d.ruled_by}` : ""}${d.owner ? ` · owner ${d.owner}` : ""}`;
              return (
                <div key={r.key} className={`g-row tz-row dec-row ${d.status}`}>
                  <button className="g-label link tz-label" onClick={() => toggle(r.key)} title={tip}>
                    <span className="g-title"><span className="mono dim">{d.number}</span> {d.title}</span>
                    <span className="g-branch">{all ? `${r.initiative} · ` : ""}{LABEL[d.status] ?? d.status}</span>
                  </button>
                  <div className="g-lane tz-lane" title={tip}>
                    {dot
                      ? <div className={`dec-dot ${d.status}`} style={{ left: (x(from) + x(to)) / 2 }} />
                      : <div className={`dec-bar ${d.status}`} style={{ left: x(from), width: Math.max(x(to) - x(from), 4) }} />}
                    <EdgePointer z={z} from={from} to={to} />
                  </div>
                </div>
              );
            })}
          </TimeFrame>
        </div>
        <div className="dec-legend meta">
          <span><i className="dec-key proposed" /> waiting (dashed, runs to today)</span>
          <span><i className="dec-key ruled" /> ruled</span>
          <span><i className="dec-key superseded" /> superseded or withdrawn</span>
          <span>a dot is raised and ruled the same day</span>
        </div>
      </section>

      <section className="dec-section">
        <h2>Ruled <span className="meta">newest first</span></h2>
        {ruled.map(record)}
        {closed.length > 0 && (
          <>
            <h3 className="meta">Superseded or withdrawn</h3>
            {closed.map(record)}
          </>
        )}
      </section>
    </div>
  );
}
