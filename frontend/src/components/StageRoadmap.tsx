import type { merge, model } from "../../wailsjs/go/models";
import type { ReactNode } from "react";
import { addDays, daysBetween, parseISO, shortDate, today, toISO } from "../lib/dates";
import "../styles/roadmap.css";

/** Where undated stages start, as a share of the lane, and the widest one slot
 *  may take. Undated stages are only order: equal slots after the last date. */
const SLOT_MAX = 16;
const SLOT_ROOM = 42;

type Gate = { id: string; record?: model.Decision; raised: Date | null; ruled: Date | null };

type Row = {
  stage: model.Stage;
  n: number;
  state: "done" | "current" | "planned";
  start: Date | null; // a real date: the previous stage's end or the stage's first gate
  end: Date | null;   // done, else target; null means undated
  toToday: boolean;   // current and undated: its solid bar runs to today
  slot: number;       // index among undated stages, -1 when dated
  gates: Gate[];
};

/** FR-20, FR-21: one row per stage in roadmap order over a shared date axis.
 *  Gates are diamonds at the date raised and, once ruled, at the date ruled.
 *  A stage without a target is a dashed bar after the last dated thing, sized
 *  by order only and labelled with its appetite; no date is computed from it. */
export function StageRoadmap({ initiative }: { initiative: merge.BoardInitiative }) {
  const now = today();
  const stages = initiative.stages ?? [];
  const records = new Map((initiative.decisions ?? []).map((d) => [d.number, d]));

  let slots = 0;
  let prevEnd: Date | null = null;
  const rows: Row[] = stages.map((s, i) => {
    const gates: Gate[] = (s.gates ?? []).map((id) => {
      const record = records.get(id);
      return { id, record, raised: parseISO(record?.raised), ruled: record?.status === "ruled" ? parseISO(record?.ruled) : null };
    });
    const end = parseISO(s.done) ?? parseISO(s.target);
    const state = s.done ? "done" : s.current ? "current" : "planned";
    const firstGate = gates.map((g) => g.raised).filter((d): d is Date => !!d).sort((a, b) => a.getTime() - b.getTime())[0] ?? null;
    let start = prevEnd ?? firstGate;
    if (start && end && start > end) start = end;
    const toToday = !end && state === "current" && !!start && start <= now;
    const slot = !end && state !== "done" ? slots++ : -1;
    prevEnd = end ?? (toToday ? now : null);
    return { stage: s, n: i + 1, state, start, end, toToday, slot, gates };
  });

  if (rows.length === 0) {
    return (
      <div className="srm-empty">
        <p>No roadmap yet.</p>
        <p className="meta">Stages come from <span className="mono">working-on/roadmap.yaml</span>; the roadmapping skill says how to cut them.</p>
      </div>
    );
  }

  // The dated region: every real date on the rows, and today.
  const dates: Date[] = [now];
  for (const r of rows) {
    if (r.start) dates.push(r.start);
    if (r.end) dates.push(r.end);
    for (const g of r.gates) { if (g.raised) dates.push(g.raised); if (g.ruled) dates.push(g.ruled); }
  }
  let from = new Date(Math.min(...dates.map((d) => d.getTime())));
  let to = new Date(Math.max(...dates.map((d) => d.getTime())));
  const span = Math.max(daysBetween(from, to), 21);
  from = addDays(from, -Math.max(2, Math.round(span * 0.04)));
  to = addDays(to, Math.max(3, Math.round(span * 0.06)));
  const total = daysBetween(from, to);
  const slot = slots ? Math.min(SLOT_MAX, SLOT_ROOM / slots) : 0;
  const dated = 100 - slot * slots;
  const pct = (d: Date) => (daysBetween(from, d) / total) * dated;
  const slotLeft = (i: number) => dated + i * slot;

  // Weekly ticks under 90 days, else monthly (design system, Timeline).
  const ticks: Date[] = [];
  if (total < 90) {
    for (let d = addDays(from, (8 - from.getDay()) % 7); d <= to; d = addDays(d, 7)) ticks.push(d);
  } else {
    for (let d = new Date(from.getFullYear(), from.getMonth() + 1, 1); d <= to; d = new Date(d.getFullYear(), d.getMonth() + 1, 1)) ticks.push(d);
  }
  // Keep a tick's label clear of today's label and of the undated edge.
  const labelled = (d: Date) => Math.abs(pct(d) - pct(now)) > 6 && (slots === 0 || pct(d) < dated - 4);
  const tickLabel = (d: Date) => (total < 90 ? shortDate(d) : d.toLocaleDateString(undefined, { month: "short" }));
  const grid = (
    <>
      {ticks.map((t) => <span key={toISO(t)} className="srm-tick" style={{ left: `${pct(t)}%` }} />)}
      {slots > 0 && <span className="srm-undated-edge" style={{ left: `${dated}%` }} />}
      <span className="srm-today" style={{ left: `${pct(now)}%` }} />
    </>
  );

  return (
    <div className="srm">
      <div className="srm-row srm-axis">
        <div className="srm-label" />
        <div className="srm-lane">
          {ticks.map((t) => (
            <span key={toISO(t)} className="srm-tick" style={{ left: `${pct(t)}%` }}>{labelled(t) && <span>{tickLabel(t)}</span>}</span>
          ))}
          {slots > 0 && (
            <span className="srm-undated-edge" style={{ left: `${dated}%` }}><span>no dates · order only</span></span>
          )}
          <span className="srm-today" style={{ left: `${pct(now)}%` }} title={`today ${toISO(now)}`}><span>today</span></span>
        </div>
      </div>
      {rows.map((r, i) => (
        <StageRow key={i} r={r} now={now} pct={pct} slotLeft={slotLeft} slot={slot} grid={grid} />
      ))}
      <div className="srm-foot">
        <span><i className="srm-key done" /> stage done</span>
        <span><i className="srm-key current" /> current stage, to today</span>
        <span><i className="srm-key planned" /> no target: order and appetite, no date</span>
        <span><i className="srm-gem waiting inline" /> decision waiting, at raised</span>
        <span><i className="srm-gem ruled inline" /> decision ruled, at ruled</span>
      </div>
    </div>
  );
}

function StageRow({ r, now, pct, slotLeft, slot, grid }: {
  r: Row; now: Date; pct: (d: Date) => number; slotLeft: (i: number) => number; slot: number; grid: ReactNode;
}) {
  const s = r.stage;
  const missing = r.gates.filter((g) => !g.record).map((g) => g.id);
  const drawn = r.gates.filter((g) => g.record && g.raised);
  const appetite = s.appetite || "no appetite";
  const state = r.state === "done" ? "done" : r.state === "current" ? "current" : "";
  const sub = r.state === "done"
    ? `done ${s.done}`
    : s.target ? `target ${s.target}` : `appetite: ${appetite}`;

  // Stagger gate labels that would collide.
  const labels = drawn
    .map((g) => ({ g, at: pct(g.ruled ?? (g.raised as Date)) }))
    .sort((a, b) => a.at - b.at);
  const lift = new Map<string, number>();
  let last = -100;
  let row = 0;
  for (const l of labels) { row = l.at - last < 5 ? row + 1 : 0; lift.set(l.g.id, row % 2); last = l.at; }

  return (
    <div className={`srm-row ${r.state}`}>
      <div className="srm-label">
        <span className="srm-n num">{r.n}{state && ` · ${state}`}</span>
        <span className="srm-title" title={s.outcome || s.title || s.id}>{s.title || s.id}</span>
        <span className="srm-sub num">{sub}</span>
        {missing.length > 0 && (
          <span className="srm-missing num">{missing.join(", ")} {missing.length === 1 ? "names" : "name"} no record, not drawn</span>
        )}
      </div>
      <div className="srm-lane">
        {grid}
        {r.end && (
          r.start && daysBetween(r.start, r.end) >= 1 ? (
            <span className={`srm-bar ${r.state}`} style={{ left: `${pct(r.start)}%`, width: `${pct(r.end) - pct(r.start)}%` }}
              title={`${s.title || s.id}: ${toISO(r.start)} → ${toISO(r.end)}${r.state === "done" ? " (done)" : " (target)"}`} />
          ) : (
            <span className={`srm-dot ${r.state}`} style={{ left: `${pct(r.end)}%` }}
              title={`${s.title || s.id}: ${r.state === "done" ? "done" : "target"} ${toISO(r.end)}`} />
          )
        )}
        {r.toToday && r.start && (
          <span className="srm-bar current" style={{ left: `${pct(r.start)}%`, width: `${Math.max(pct(now) - pct(r.start), 0.6)}%` }}
            title={`${s.title || s.id}: since ${toISO(r.start)}, in progress`} />
        )}
        {r.slot >= 0 && (
          <span className={`srm-bar planned ${r.state}`} style={{ left: `${slotLeft(r.slot) + 0.6}%`, width: `${slot - 1.2}%` }}
            title={`${s.title || s.id}: no target. Sized by order only; appetite ${appetite}. No date is computed from it.`}>
            <span className="srm-appetite">{appetite}</span>
          </span>
        )}
        {drawn.map((g) => {
          const d = g.record as model.Decision;
          const tip = `${d.number} ${d.title}`;
          if (g.ruled) {
            return (
              <span key={g.id}>
                <span className="srm-link" style={{ left: `${pct(g.raised as Date)}%`, width: `${pct(g.ruled) - pct(g.raised as Date)}%` }} />
                <span className="srm-gem raised" style={{ left: `${pct(g.raised as Date)}%` }} title={`${tip}\nraised ${d.raised}`} />
                <span className="srm-gem ruled" style={{ left: `${pct(g.ruled)}%` }} title={`${tip}\nruled ${d.ruled}${d.ruled_by ? ` by ${d.ruled_by}` : ""}${d.chosen ? `: ${d.chosen}` : ""}`} />
                <span className={`srm-gem-label num lift-${lift.get(g.id)}`} style={{ left: `${pct(g.ruled)}%` }}>{d.number}</span>
              </span>
            );
          }
          const age = daysBetween(g.raised as Date, now);
          return (
            <span key={g.id}>
              <span className="srm-gem waiting" style={{ left: `${pct(g.raised as Date)}%` }} title={`${tip}\nwaiting since ${d.raised}${d.owner ? ` on ${d.owner}` : ""}`} />
              <span className={`srm-gem-label waiting num lift-${lift.get(g.id)}`} style={{ left: `${pct(g.raised as Date)}%` }}>{d.number} · {age}d</span>
            </span>
          );
        })}
      </div>
    </div>
  );
}
