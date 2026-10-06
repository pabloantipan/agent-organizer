import { useState, type ReactNode } from "react";
import type { merge } from "../../wailsjs/go/models";
import { DAY, toISO } from "../lib/dates";
import { addLocalDays, dayMonth, endOf, hhmm, offersHours, startOfDay, timesLabel, when, type When } from "../lib/axis";
import { cardBar } from "../lib/cardBar";
import { useBoard } from "../stores/board.store";
import { DayBand, EdgePointer, TimeFrame, ZoomControl, useTimeZoom } from "./TimeZoom";

type Props = { initiative: merge.BoardInitiative; cards: merge.BoardCard[]; collapsible?: boolean; defaultOpen?: boolean; head?: ReactNode };

type Row = { card: merge.BoardCard; start: When; end: When; openEnded: boolean; dot: boolean; overdue: boolean };

const HOURS_NOTE = "Dates without a time of day fill their whole day.";

/** A mark's date for a title: the day, and the time when it has one. */
const stamp = (w: When) => (w.timed ? `${toISO(new Date(w.at))} ${hhmm(w.at)}` : toISO(new Date(w.at)));

/** Gantt: one row per open card over the shared time axis, milestones and
 *  target on the axis, today as a line. Starts come from a card's own start,
 *  else git (the branch's first commit, to the minute), else updated; ends
 *  from due, else today for work in flight, else git. A whole-day date covers
 *  its day (the day-end rule); the zoom is Fit, Days, and Hours when a git
 *  end carries a time (docs/ux/specs/roadmap-time-zoom.md). */
export function Roadmap({ initiative, cards, collapsible = true, defaultOpen = false, head }: Props) {
  const select = useBoard((s) => s.select);
  const [open, setOpen] = useState(defaultOpen);
  const nowMs = Date.now();
  const today = startOfDay(nowMs);
  const started = when(initiative.started);
  const target = when(initiative.target);
  const milestones = (initiative.milestones ?? [])
    .map((m) => ({ date: when(m.date), title: m.title }))
    .filter((m): m is { date: When; title: string } => !!m.date && !m.date.timed);

  const rows: Row[] = cards.map((c) => ({ card: c, ...cardBar(c, today) }));

  // The Fit span as built: every date and today, padded; then each date ends
  // at the end of its day.
  const startsAt = [today, ...rows.map((r) => r.start.at), ...milestones.map((m) => m.date.at), ...(target ? [target.at] : [])];
  if (started && started.at > addLocalDays(today, -365)) startsAt.push(started.at);
  const endsAt = [addLocalDays(today, 1), ...rows.map((r) => endOf(r.end)), ...milestones.map((m) => endOf(m.date)), ...(target ? [endOf(target)] : [])];
  const dataFrom = Math.min(...startsAt);
  const dataTo = Math.max(...endsAt);
  const span = Math.max((dataTo - dataFrom) / DAY, 21);
  const fit = { from: addLocalDays(dataFrom, -Math.max(2, Math.round(span * 0.04))), to: addLocalDays(dataTo, Math.max(4, Math.round(span * 0.12))) };
  const hours = offersHours(rows.flatMap((r) => [r.start, r.openEnded ? null : r.end]));
  const z = useTimeZoom({ fit, data: { from: dataFrom, to: Math.max(dataTo, nowMs) }, hours, reset: initiative.id });

  const hasAnything = rows.length > 0 || milestones.length > 0 || !!target;
  if (!hasAnything) return <>{head}<div className="meta roadmap-empty">No open cards or dates to draw.</div></>;

  const x = z.scale.x;
  const atHours = z.level === "hours";
  // Open-ended work runs to the end of today, and to now at Hours.
  const endAt = (r: Row) => (r.openEnded ? (atHours ? nowMs : addLocalDays(today, 1)) : endOf(r.end));
  // At Hours a bar says its times, then its due, after its end (§A1.5).
  const afterBar = (r: Row) => [timesLabel(r.start, r.openEnded ? null : r.end), r.card.due ? `due end of ${dayMonth(r.end.at)}` : ""].filter(Boolean).join(" · ");
  const dayMid = (w: When) => (x(w.at) + x(endOf(w))) / 2;
  const dayOnly = atHours && (rows.some((r) => r.dot) || milestones.length > 0 || !!target);
  const labelRow = (() => { const used = new Map<number, number>(); return (w: When) => { const r = used.get(w.at) ?? 0; used.set(w.at, r + 1); return r; }; })();
  const onAxis = (w: When, cls: string, title: string, label: ReactNode, k: string | number) => (
    <span key={k}>
      {atHours && <span className="tz-band axis" style={{ left: x(w.at), width: x(endOf(w)) - x(w.at) }} />}
      <div className={`g-mark ${cls}`} style={{ left: atHours ? x(w.at) : dayMid(w), ["--row" as string]: labelRow(w) }} title={title}><i />{label}</div>
    </span>
  );

  const control = <ZoomControl z={z} note={dayOnly ? HOURS_NOTE : undefined} />;
  return (
    <div className="gantt">
      {head !== undefined && <div className="tz-head">{head}{(open || !collapsible) && control}</div>}
      {collapsible && (
        <div className="tz-head">
          <button className="ghost gantt-toggle" onClick={() => setOpen(!open)}>
            {open ? "▾" : "▸"} Roadmap <span className="meta">{rows.length} card{rows.length === 1 ? "" : "s"}{milestones.length ? `, ${milestones.length} milestone${milestones.length === 1 ? "" : "s"}` : ""}{target ? `, target ${initiative.target}` : ""}</span>
          </button>
          {open && head === undefined && control}
        </div>
      )}
      {!collapsible && head === undefined && <div className="tz-head">{control}</div>}
      {(open || !collapsible) && (
        <div className="gantt-body tz-host">
          <TimeFrame
            z={z}
            label="Cards timeline"
            extents={rows.map((r) => ({ from: r.start.at, to: endAt(r) }))}
            axis={<>
              {started && started.at >= z.scale.from && onAxis(started, "start", `started ${initiative.started}`, null, "started")}
              {milestones.map((m, k) => onAxis(m.date, `ms ${m.date.at < today ? "past" : ""}`, `${m.title} · ${toISO(new Date(m.date.at))}`, <span>{m.title}</span>, k))}
              {target && onAxis(target, `target ${target.at < today ? "past" : ""}`, `target ${initiative.target}`, <span>target {dayMonth(target.at)}</span>, "target")}
            </>}
          >
            {rows.map((r) => {
              const from = r.start.at;
              const to = endAt(r);
              return (
                <div key={r.card.slug} className={`g-row tz-row ${r.card.status}`}>
                  <button className="g-label link tz-label" onClick={() => select(r.card)} title={r.card.title || r.card.slug}>
                    <span className="g-title">{r.card.title || r.card.slug}</span>
                    {r.card.branch && r.card.branch !== "none" && <span className="g-branch mono">{r.card.branch}</span>}
                  </button>
                  <div className="g-lane tz-lane">
                    {r.dot ? (
                      atHours ? (
                        <DayBand z={z} from={from} to={to} status={r.card.status} dot="g-dot" title={`${r.card.slug} · ${toISO(new Date(from))}, all day: no time recorded`} />
                      ) : (
                        <div className={`g-dot ${r.card.status}`} style={{ left: dayMid(r.start) }} title={`${r.card.slug} · ${toISO(new Date(from))}`} />
                      )
                    ) : (
                      <>
                      <div
                        className={`g-bar ${r.card.status} ${r.openEnded ? "open" : ""} ${r.overdue ? "overdue" : ""}`}
                        style={{ left: x(from), width: Math.max(x(to) - x(from), 4) }}
                        title={`${stamp(r.start)} → ${r.openEnded ? "in progress" : stamp(r.end)}${!r.card.start && r.card.branch_start ? " (start from git)" : ""}`}
                      >
                        {r.card.due && !atHours && <span className="g-due">{dayMonth(r.end.at)}</span>}
                      </div>
                      {atHours && afterBar(r) && <span className="g-due tz-after" style={{ left: x(to) }}>{afterBar(r)}</span>}
                      </>
                    )}
                    <EdgePointer z={z} from={from} to={to} />
                  </div>
                </div>
              );
            })}
          </TimeFrame>
        </div>
      )}
    </div>
  );
}
