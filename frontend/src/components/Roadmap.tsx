import { useState } from "react";
import type { merge } from "../../wailsjs/go/models";
import { addDays, daysBetween, parseISO, shortDate, today, toISO } from "../lib/dates";
import { useBoard } from "../stores/board.store";

type Props = { initiative: merge.BoardInitiative; cards: merge.BoardCard[]; collapsible?: boolean; defaultOpen?: boolean };

type Row = { card: merge.BoardCard; start: Date; end: Date; openEnded: boolean; dot: boolean; overdue: boolean };

/** Gantt: one row per open card over a shared axis, milestones and target on
 *  the axis, today as a line. Starts come from git (branch first commit) or a
 *  card's own start; ends from due, else today for work in flight. */
export function Roadmap({ initiative, cards, collapsible = true, defaultOpen = false }: Props) {
  const select = useBoard((s) => s.select);
  const [open, setOpen] = useState(defaultOpen);
  const now = today();
  const started = parseISO(initiative.started);
  const target = parseISO(initiative.target);
  const milestones = (initiative.milestones ?? [])
    .map((m) => ({ date: parseISO(m.date), title: m.title }))
    .filter((m): m is { date: Date; title: string } => !!m.date);

  const rows: Row[] = cards.map((c) => {
    const due = parseISO(c.due);
    const start = parseISO(c.start) ?? parseISO(c.branch_start) ?? parseISO(c.updated) ?? now;
    let end: Date;
    let openEnded = false;
    if (due) end = due;
    else if (c.status === "now") { end = now; openEnded = true; }
    else end = parseISO(c.branch_last) ?? start;
    if (end < start) end = start;
    const dot = daysBetween(start, end) < 1 && !openEnded;
    return { card: c, start, end, openEnded, dot, overdue: !!due && due < now };
  });

  const hasAnything = rows.length > 0 || milestones.length > 0 || !!target;
  if (!hasAnything) return <div className="meta roadmap-empty">No open cards or dates to draw.</div>;

  const dates = [now, ...rows.flatMap((r) => [r.start, r.end]), ...milestones.map((m) => m.date), ...(target ? [target] : [])];
  if (started && started > addDays(now, -365)) dates.push(started);
  let start = new Date(Math.min(...dates.map((d) => d.getTime())));
  let end = new Date(Math.max(...dates.map((d) => d.getTime())));
  const span = Math.max(daysBetween(start, end), 21);
  start = addDays(start, -Math.max(2, Math.round(span * 0.04)));
  end = addDays(end, Math.max(4, Math.round(span * 0.12)));
  const total = daysBetween(start, end);
  const pct = (d: Date) => (daysBetween(start, d) / total) * 100;
  const ticks: Date[] = [];
  for (let d = new Date(start.getFullYear(), start.getMonth() + 1, 1); d <= end; d = new Date(d.getFullYear(), d.getMonth() + 1, 1)) ticks.push(d);
  const labelRow = (() => { const used = new Map<string, number>(); return (d: Date) => { const k = toISO(d); const r = used.get(k) ?? 0; used.set(k, r + 1); return r; }; })();

  return (
    <div className="gantt">
      {collapsible && (
        <button className="ghost gantt-toggle" onClick={() => setOpen(!open)}>
          {open ? "▾" : "▸"} Roadmap <span className="meta">{rows.length} card{rows.length === 1 ? "" : "s"}{milestones.length ? `, ${milestones.length} milestone${milestones.length === 1 ? "" : "s"}` : ""}{target ? `, target ${initiative.target}` : ""}</span>
        </button>
      )}
      {(open || !collapsible) && (
        <div className="gantt-body">
          {/* axis */}
          <div className="g-row g-axis">
            <div className="g-label" />
            <div className="g-lane">
              {ticks.map((t) => (
                <div key={toISO(t)} className="g-tick" style={{ left: `${pct(t)}%` }}><span>{t.toLocaleDateString(undefined, { month: "short" })}</span></div>
              ))}
              {started && pct(started) >= 0 && <div className="g-mark start" style={{ left: `${pct(started)}%` }} title={`started ${initiative.started}`}><i /></div>}
              {milestones.map((m, k) => (
                <div key={k} className={`g-mark ms ${m.date < now ? "past" : ""}`} style={{ left: `${pct(m.date)}%`, ["--row" as string]: labelRow(m.date) }} title={`${m.title} · ${toISO(m.date)}`}><i /><span>{m.title}</span></div>
              ))}
              {target && (
                <div className={`g-mark target ${target < now ? "past" : ""}`} style={{ left: `${pct(target)}%`, ["--row" as string]: labelRow(target) }} title={`target ${initiative.target}`}><i /><span>target {shortDate(target)}</span></div>
              )}
            </div>
          </div>
          {/* rows */}
          {rows.map((r) => (
            <div key={r.card.slug} className={`g-row ${r.card.status}`}>
              <button className="g-label link" onClick={() => select(r.card)} title={r.card.title || r.card.slug}>
                <span className="g-title">{r.card.title || r.card.slug}</span>
                {r.card.branch && r.card.branch !== "none" && <span className="g-branch mono">{r.card.branch}</span>}
              </button>
              <div className="g-lane">
                {ticks.map((t) => <div key={toISO(t)} className="g-tick faint" style={{ left: `${pct(t)}%` }} />)}
                {r.dot ? (
                  <div className={`g-dot ${r.card.status}`} style={{ left: `${pct(r.start)}%` }} title={`${r.card.slug} · ${toISO(r.start)}`} />
                ) : (
                  <div
                    className={`g-bar ${r.card.status} ${r.openEnded ? "open" : ""} ${r.overdue ? "overdue" : ""}`}
                    style={{ left: `${pct(r.start)}%`, width: `${Math.max(pct(r.end) - pct(r.start), 0.6)}%` }}
                    title={`${toISO(r.start)} → ${r.openEnded ? "in progress" : toISO(r.end)}${r.card.branch_start ? " (start from git)" : ""}`}
                  >
                    {r.card.due && <span className="g-due">{shortDate(r.end)}</span>}
                  </div>
                )}
              </div>
            </div>
          ))}
          <div className="g-today" style={{ left: `calc(240px + (100% - 264px) * ${pct(now) / 100})` }}><span>today</span></div>
        </div>
      )}
    </div>
  );
}
