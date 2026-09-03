import { useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { addDays, daysBetween, monthGrid, monthLabel, shortDate, today, toISO } from "../lib/dates";
import { planItems, type PlanItem } from "../lib/plan";
import { useBoard } from "../stores/board.store";

export function Calendar() {
  const { view, select, filterClient, filterMachine, selectedInitiative, setSelectedInitiative } = useBoard();
  const now = today();
  const [cursor, setCursor] = useState(new Date(now.getFullYear(), now.getMonth(), 1));
  const items = useMemo(() => (view ? planItems(view.board) : []), [view]);
  if (!view) return <div className="empty">Loading…</div>;

  const visibleInit = new Set(
    (view.board.initiatives ?? [])
      .filter((i) => (!filterClient || i.client === filterClient) && (!filterMachine || i.machine === filterMachine))
      .map((i) => i.id),
  );
  const shown = items.filter((it) => visibleInit.has(it.initiative) && (!selectedInitiative || it.initiative === selectedInitiative));
  const byDay = new Map<string, PlanItem[]>();
  for (const it of shown) {
    const k = toISO(it.date);
    byDay.set(k, [...(byDay.get(k) ?? []), it]);
  }
  const days = monthGrid(cursor.getFullYear(), cursor.getMonth());
  const overdue = shown.filter((it) => it.kind === "due" && it.date < now);
  const upcoming = shown.filter((it) => it.date >= now && daysBetween(now, it.date) <= 30);

  const selected = selectedInitiative ? (view.board.initiatives ?? []).find((i) => i.id === selectedInitiative) : null;

  return (
    <div className="cal">
      <div className="cal-main">
        {selected && (
          <div className="cal-head">
            <h1 className="ident">{selected.id}</h1>
            <span className="meta">{selected.title}</span>
          </div>
        )}

        <div className="cal-bar">
          <button className="ghost" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))} aria-label="Previous month"><ChevronLeft size={16} /></button>
          <h1>{monthLabel(cursor)}</h1>
          <button className="ghost" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))} aria-label="Next month"><ChevronRight size={16} /></button>
          <button className="ghost" onClick={() => setCursor(new Date(now.getFullYear(), now.getMonth(), 1))}><CalendarDays size={14} /> Today</button>
          <span className="spacer" />
          <span className="cal-legend">
            <span><i className="lg due" /> card due</span>
            <span><i className="lg ms" /> milestone</span>
            <span><i className="lg target" /> target</span>
          </span>
        </div>
        <div className="cal-grid">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
            <div key={d} className="cal-dow">{d}</div>
          ))}
          {days.map((d) => {
            const k = toISO(d);
            const inMonth = d.getMonth() === cursor.getMonth();
            const isToday = k === toISO(now);
            const list = byDay.get(k) ?? [];
            return (
              <div key={k} className={`cal-cell ${inMonth ? "" : "out"} ${isToday ? "today" : ""} ${d.getDay() === 0 || d.getDay() === 6 ? "wk" : ""}`}>
                <div className="cal-day">{d.getDate()}</div>
                {list.map((it, i) => <Chip key={i} it={it} onOpen={select} past={it.date < now} />)}
              </div>
            );
          })}
        </div>
      </div>
      <aside className="cal-side">
        {overdue.length > 0 && (
          <>
            <div className="section-label stale">Overdue</div>
            <Agenda items={overdue} onOpen={select} now={now} />
          </>
        )}
        <div className="section-label">Next 30 days</div>
        {upcoming.length === 0 ? <div className="meta">Nothing dated. Dates come from card `due`, initiative `target` and `milestones`.</div> : <Agenda items={upcoming} onOpen={select} now={now} />}
      </aside>
    </div>
  );
}

function Chip({ it, onOpen, past }: { it: PlanItem; onOpen: (c: any) => void; past: boolean }) {
  if (it.kind === "due") {
    return (
      <button className={`chip due ${it.card.status} ${past ? "past" : ""}`} onClick={() => onOpen(it.card)} title={`${it.initiative}: ${it.card.title || it.card.slug}`}>
        <b>{it.initiative}</b> {it.card.title || it.card.slug}
      </button>
    );
  }
  if (it.kind === "milestone") {
    return <div className={`chip ms ${past ? "past" : ""}`} title={`${it.initiative}: ${it.title}`}><b>{it.initiative}</b> {it.title}</div>;
  }
  return <div className={`chip target ${past ? "past" : ""}`} title={`${it.initiative} target`}><b>{it.initiative}</b> target</div>;
}

function Agenda({ items, onOpen, now }: { items: PlanItem[]; onOpen: (c: any) => void; now: Date }) {
  return (
    <ul className="agenda">
      {items.map((it, i) => {
        const d = daysBetween(now, it.date);
        const when = d === 0 ? "today" : d === 1 ? "tomorrow" : d < 0 ? `${-d}d ago` : `in ${d}d`;
        return (
          <li key={i} className={it.kind === "due" ? `due ${it.card.status}` : it.kind}>
            <span className="ag-date mono">{shortDate(it.date)}</span>
            <span className="ag-when meta">{when}</span>
            <span className="ag-init ident">{it.initiative}</span>
            {it.kind === "due" && <button className="ag-title link" onClick={() => onOpen(it.card)}>{it.card.title || it.card.slug}</button>}
            {it.kind === "milestone" && <span className="ag-title">{it.title}</span>}
            {it.kind === "target" && <span className="ag-title">target date</span>}
          </li>
        );
      })}
    </ul>
  );
}

// keep addDays referenced for future week view
void addDays;
