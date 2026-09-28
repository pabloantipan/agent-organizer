import { useMemo, useState } from "react";
import { marked } from "marked";
import type { merge, model } from "../../wailsjs/go/models";
import { addDays, daysBetween, parseISO, shortDate, today, toISO } from "../lib/dates";
import { readOnlyOf } from "../lib/queue";
import { useBoard } from "../stores/board.store";
import { RuleDecisionBox } from "./RuleDecisionBox";
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
  const { view, selectedInitiative, select } = useBoard();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [ruling, setRuling] = useState<string | null>(null);
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
      <h1>{selectedInitiative ?? "All initiatives"}</h1>
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
    return (
      <div key={r.key} className={`dec ${d.status} ${isOpen ? "expanded" : ""}`}>
        <button className="dec-line" onClick={() => toggle(r.key)} title={isOpen ? "collapse" : "show the record"}>
          <span className="dec-num mono">{d.number}</span>
          <span className="dec-title">{d.title}</span>
          {all && <span className="badge">{r.initiative}</span>}
          <span className={`badge dec-status ${d.status}`}>{LABEL[d.status] ?? d.status}</span>
          <span className="dec-meta">
            {d.status === "proposed"
              ? <>owner {d.owner || "—"} · <b>{age(d)}d</b> waiting</>
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
                  <button className="primary" aria-expanded={isRuling} onClick={() => setRuling(isRuling ? null : r.key)}>Rule</button>
                  {isRuling && <RuleDecisionBox initiative={r.initiative} decision={d} onClose={() => setRuling(null)} />}
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

  // Timeline: one row per decision, raised → ruled, open ones running to today.
  const shown = [...rows].filter((r) => showClosed || (r.d.status !== "superseded" && r.d.status !== "withdrawn")).sort((a, b) => a.d.raised.localeCompare(b.d.raised) || a.d.number.localeCompare(b.d.number));
  const dates = [now, ...shown.flatMap((r) => [parseISO(r.d.raised), parseISO(r.d.ruled)]).filter((d): d is Date => !!d)];
  let start = new Date(Math.min(...dates.map((d) => d.getTime())));
  let end = new Date(Math.max(...dates.map((d) => d.getTime())));
  const span = Math.max(daysBetween(start, end), 14);
  start = addDays(start, -Math.max(1, Math.round(span * 0.04)));
  end = addDays(end, Math.max(2, Math.round(span * 0.08)));
  const total = Math.max(daysBetween(start, end), 1);
  const pct = (d: Date) => (daysBetween(start, d) / total) * 100;
  const weekly = total <= 90;
  const ticks: Date[] = [];
  if (weekly) {
    const first = addDays(start, (8 - start.getDay()) % 7);
    for (let d = first; d <= end; d = addDays(d, 7)) ticks.push(d);
  } else {
    for (let d = new Date(start.getFullYear(), start.getMonth() + 1, 1); d <= end; d = new Date(d.getFullYear(), d.getMonth() + 1, 1)) ticks.push(d);
  }

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
        <h2>
          Timeline <span className="meta">raised → ruled; open ones run to today</span>
          {closed.length > 0 && (
            <button className="ghost small" onClick={() => setShowClosed(!showClosed)}>{showClosed ? "hide" : "show"} {closed.length} superseded or withdrawn</button>
          )}
        </h2>
        <div className="gantt-body dec-timeline">
          <div className="g-row g-axis">
            <div className="g-label" />
            <div className="g-lane">
              {ticks.map((t) => (
                <div key={toISO(t)} className="g-tick" style={{ left: `${pct(t)}%` }}>
                  <span>{weekly ? shortDate(t) : t.toLocaleDateString(undefined, { month: "short" })}</span>
                </div>
              ))}
            </div>
          </div>
          {shown.map((r) => {
            const d = r.d;
            const raised = parseISO(d.raised) ?? now;
            const ruledAt = parseISO(d.ruled);
            const until = d.status === "proposed" ? now : ruledAt ?? raised;
            const dot = daysBetween(raised, until) < 1;
            const tip = `${d.number} ${d.title}\n${LABEL[d.status] ?? d.status} · raised ${d.raised}${d.ruled ? ` · ruled ${d.ruled} by ${d.ruled_by}` : ""}${d.owner ? ` · owner ${d.owner}` : ""}`;
            return (
              <div key={r.key} className={`g-row dec-row ${d.status}`}>
                <button className="g-label link" onClick={() => toggle(r.key)} title={tip}>
                  <span className="g-title"><span className="mono dim">{d.number}</span> {d.title}</span>
                  <span className="g-branch">{all ? `${r.initiative} · ` : ""}{LABEL[d.status] ?? d.status}</span>
                </button>
                <div className="g-lane" title={tip}>
                  {ticks.map((t) => <div key={toISO(t)} className="g-tick faint" style={{ left: `${pct(t)}%` }} />)}
                  {dot
                    ? <div className={`dec-dot ${d.status}`} style={{ left: `${pct(raised)}%` }} />
                    : <div className={`dec-bar ${d.status}`} style={{ left: `${pct(raised)}%`, width: `${Math.max(pct(until) - pct(raised), 0.8)}%` }} />}
                </div>
              </div>
            );
          })}
          <div className="g-today" style={{ left: `calc(240px + (100% - 264px) * ${pct(now) / 100})` }}><span>today</span></div>
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
