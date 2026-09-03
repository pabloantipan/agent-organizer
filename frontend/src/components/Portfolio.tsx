import type { merge } from "../../wailsjs/go/models";
import { addDays, daysBetween, parseISO, shortDate, today, toISO } from "../lib/dates";
import { uniq } from "../lib";
import { useBoard } from "../stores/board.store";

type Row = { id: string; client: string; start: Date; end: Date; openEnded: boolean; now: number; target: Date | null; milestones: { date: Date; title: string }[] };

/** Portfolio Gantt: one row per initiative, in priority order. Click a row to
 *  drill into that initiative's card-level roadmap. */
export function Portfolio() {
  const { view, setSelectedInitiative } = useBoard();
  if (!view) return null;
  const now = today();
  const inits = view.board.initiatives ?? [];
  const cols = view.board.columns ?? {};
  const ids = uniq(inits.map((i) => i.id));

  const rows: Row[] = ids.map((id) => {
    const i = inits.find((x) => x.id === id)!;
    const cards = ["now", "blocked", "next"].flatMap((st) => (cols[st] ?? []).filter((c) => c.initiative_id === id));
    const starts = cards.map((c) => parseISO(c.start) ?? parseISO(c.branch_start)).filter((d): d is Date => !!d);
    const ends = cards.map((c) => parseISO(c.due) ?? parseISO(c.branch_last)).filter((d): d is Date => !!d);
    const started = parseISO(i.started);
    const target = parseISO(i.target);
    const milestones = (i.milestones ?? []).map((m) => ({ date: parseISO(m.date), title: m.title })).filter((m): m is { date: Date; title: string } => !!m.date);
    const startCandidates = [...starts, ...(started ? [started] : [])];
    const start = startCandidates.length ? new Date(Math.min(...startCandidates.map((d) => d.getTime()))) : now;
    const nowCount = cards.filter((c) => c.status === "now").length;
    const endCandidates = [...ends, ...(target ? [target] : []), ...milestones.map((m) => m.date), ...(nowCount > 0 ? [now] : [])];
    let end = endCandidates.length ? new Date(Math.max(...endCandidates.map((d) => d.getTime()))) : start;
    if (end < start) end = start;
    const openEnded = nowCount > 0 && !target && !ends.some((d) => d > now);
    return { id, client: i.client, start, end, openEnded, now: nowCount, target, milestones };
  });
  if (rows.length === 0) return null;

  const dates = [now, ...rows.flatMap((r) => [r.start, r.end])];
  let start = new Date(Math.min(...dates.map((d) => d.getTime())));
  let end = new Date(Math.max(...dates.map((d) => d.getTime())));
  const span = Math.max(daysBetween(start, end), 30);
  start = addDays(start, -Math.max(3, Math.round(span * 0.04)));
  end = addDays(end, Math.max(7, Math.round(span * 0.12)));
  const total = daysBetween(start, end);
  const pct = (d: Date) => (daysBetween(start, d) / total) * 100;
  const ticks: Date[] = [];
  for (let d = new Date(start.getFullYear(), start.getMonth() + 1, 1); d <= end; d = new Date(d.getFullYear(), d.getMonth() + 1, 1)) ticks.push(d);

  return (
    <div className="gantt">
      <div className="gantt-body">
        <div className="g-row g-axis">
          <div className="g-label"><span className="meta">All initiatives, by priority. Click one to drill in.</span></div>
          <div className="g-lane">
            {ticks.map((t) => (
              <div key={toISO(t)} className="g-tick" style={{ left: `${pct(t)}%` }}><span>{t.toLocaleDateString(undefined, { month: "short", year: t.getMonth() === 0 ? "numeric" : undefined })}</span></div>
            ))}
          </div>
        </div>
        {rows.map((r) => (
          <div key={r.id} className="g-row portfolio">
            <button className="g-label link" onClick={() => setSelectedInitiative(r.id)} title={`open ${r.id}`}>
              <span className="g-title ident">{r.id}</span>
              <span className="g-branch">{r.client}{r.now > 0 ? ` · ${r.now} in flight` : ""}</span>
            </button>
            <div className="g-lane">
              {ticks.map((t) => <div key={toISO(t)} className="g-tick faint" style={{ left: `${pct(t)}%` }} />)}
              <div
                className={`g-bar init ${r.now > 0 ? "now" : "next"} ${r.openEnded ? "open" : ""}`}
                style={{ left: `${pct(r.start)}%`, width: `${Math.max(pct(r.end) - pct(r.start), 0.8)}%` }}
                title={`${toISO(r.start)} → ${r.openEnded ? "in progress" : toISO(r.end)}`}
              />
              {r.milestones.map((m, k) => (
                <div key={k} className={`g-mark ms inrow ${m.date < now ? "past" : ""}`} style={{ left: `${pct(m.date)}%` }} title={`${m.title} · ${toISO(m.date)}`}><i /></div>
              ))}
              {r.target && (
                <div className={`g-mark target inrow ${r.target < now ? "past" : ""}`} style={{ left: `${pct(r.target)}%` }} title={`target ${toISO(r.target)}`}><i /><span>{shortDate(r.target)}</span></div>
              )}
            </div>
          </div>
        ))}
        <div className="g-today" style={{ left: `calc(240px + (100% - 264px) * ${pct(now) / 100})` }}><span>today</span></div>
      </div>
    </div>
  );
}
