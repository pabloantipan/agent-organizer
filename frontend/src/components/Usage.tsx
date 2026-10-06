import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Usage as fetchUsage } from "../../wailsjs/go/main/App";
import { useBoard } from "../stores/board.store";
import {
  changeWords, compact, forInitiative, moneyOf, unknownMoney, unknownWords, hoursWords, kindsLargestFirst, money, sessionsWords, shiftWeek, totalsNotes, weekDays, weekLabel,
  type Cut, type UsageRow, type UsageSession, type UsageTotals, type WeekPoint,
} from "../lib/usage";
import { UsageChart } from "./UsageChart";
import { UsageTable } from "./UsageTable";
import { UsageSessions } from "./UsageSessions";
import "../styles/usage.css";

/** What App.Usage returns (usage.View), read as plain JSON. */
export type UsageData = {
  machine: string;
  week: string;
  this_week: UsageTotals;
  last_week: UsageTotals;
  first_day: string;
  history: WeekPoint[];
  weeks: WeekPoint[];
  cuts: Record<string, UsageRow[]>;
  sessions: UsageSession[];
};

const CUT_KEY = "organizer.usage.cut";
const storedCut = (): Cut => {
  try {
    const v = localStorage.getItem(CUT_KEY);
    return v === "role" || v === "task" || v === "model" ? v : "initiative";
  } catch { return "initiative"; }
};

/** The Usage view (docs/specs/usage.md FR-5, docs/ux/specs/usage.md): one
 *  week of every Claude session on this Mac, tokens by kind and money.
 *  Money shows here and nowhere else (FR-6, 0099); every amount is what
 *  App.Usage carries, summed at most, never priced from tokens (0098). */
export function Usage() {
  const { usageFilter, setUsageFilter, view: board } = useBoard();
  // null is this week, whichever it is when the view opens.
  const [week, setWeek] = useState<string | null>(null);
  const [data, setData] = useState<UsageData | null>(null);
  const [thisWeek, setThisWeek] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cut, setCutState] = useState<Cut>(usageFilter ? "task" : storedCut);
  const setCut = (c: Cut) => { setCutState(c); try { localStorage.setItem(CUT_KEY, c); } catch { /* per-viewer convenience only */ } };
  const seq = useRef(0);

  useEffect(() => {
    const n = ++seq.current;
    setLoading(true);
    fetchUsage(week ?? "").then(
      (v) => {
        if (n !== seq.current) return;
        const d = v as unknown as UsageData;
        setData(d);
        setError(null);
        if (week === null) setThisWeek(d.week);
      },
      (e) => { if (n === seq.current) setError(String(e)); },
    ).finally(() => { if (n === seq.current) setLoading(false); });
  }, [week]);

  if (!data) {
    return (
      <div className="usage">
        <div className="usage-head"><h1>Usage</h1></div>
        {error ? <div className="empty-state"><div>Usage could not be read: {error}</div><div className="sub">Check ~/.local/share/organizer/organizer.log, then reopen Usage.</div></div>
          : <div className="usage-line">Reading this Mac's sessions…</div>}
      </div>
    );
  }
  if (!data.first_day) {
    return (
      <div className="usage">
        <div className="usage-head"><h1>Usage</h1></div>
        <div className="usage-line">No sessions recorded yet. Usage fills in as Claude sessions run on this Mac.</div>
      </div>
    );
  }

  const current = thisWeek ?? data.week;
  const others = (board?.board.machines ?? []).filter((m) => m && m !== data.machine);
  return (
    <div className={`usage ${loading ? "loading" : ""}`} aria-busy={loading}>
      <div className="usage-head">
        <h1>Usage</h1>
        <WeekPicker data={data} thisWeek={current} onPick={(w) => setWeek(w === current ? null : w)} />
        <span className="spacer" />
        {usageFilter && (
          <button className="ghost usage-filter" onClick={() => setUsageFilter(null)} title="Show every initiative">
            <span className="mono">{usageFilter}</span> only <X size={12} aria-hidden="true" />
          </button>
        )}
        <span className="usage-mac" tabIndex={0}
          title={`${others.length ? others.join(" and ") + "'s" : "The other Mac's"} usage is not here yet.`}
          aria-label={`This Mac only (${data.machine}). ${others.length ? others.join(" and ") + "'s" : "The other Mac's"} usage is not here yet.`}>
          This Mac only
        </span>
      </div>
      {error && <div className="usage-line err">That week could not be read: {error}</div>}
      <Week data={data} thisWeek={current} cut={cut} setCut={setCut} filter={usageFilter} onPick={(w) => setWeek(w === current ? null : w)} />
    </div>
  );
}

function Week({ data, thisWeek, cut, setCut, filter, onPick }: { data: UsageData; thisWeek: string; cut: Cut; setCut: (c: Cut) => void; filter: string | null; onPick: (w: string) => void }) {
  const one = useMemo(() => (filter ? forInitiative(data.sessions ?? [], filter) : null), [data, filter]);
  const t = one ? one.totals : data.this_week;
  const cuts = (one ? one.cuts : data.cuts) as Record<string, UsageRow[]>;
  const sessions = one ? one.sessions : data.sessions ?? [];
  const empty = t.sessions === 0;
  // Wholly unknown money already says so on the tile; the note would repeat it.
  const notes = totalsNotes(unknownMoney(t) ? { ...t, without_cost: 0 } : t);
  return (
    <>
      <div className="usage-tiles">
        <div className="stat-tile">
          <span className="stat-label">Money</span>
          <b className="stat-value num" title={unknownMoney(t) ? unknownWords(t.sessions) : undefined}>{moneyOf(t)}</b>
          <span className="stat-sub">{one ? `${filter} only` : changeWords(data.this_week.money, data.last_week.money, { now: unknownMoney(data.this_week) ? data.this_week.sessions : 0, last: unknownMoney(data.last_week) })}</span>
          {notes.length > 0 && <span className="stat-sub">{notes.join(" · ")}</span>}
        </div>
        <div className="stat-tile">
          <span className="stat-label">Tokens</span>
          <b className="stat-value num">{compact(t.tokens)} tokens</b>
          <span className="stat-sub num">{kindsLargestFirst(t).map((k) => <span key={k.kind} className="usage-kind">{k.name} {compact(k.value)}</span>)}</span>
        </div>
        <div className="stat-tile">
          <span className="stat-label">Sessions</span>
          <b className="stat-value num">{sessionsWords(t.sessions)}</b>
          {!empty && <span className="stat-sub">{hoursWords(t.hours)}</span>}
          {t.running > 0 && <span className="stat-sub">{t.running} running</span>}
        </div>
      </div>
      <UsageChart history={data.history ?? []} week={data.week} thisWeek={thisWeek} onPick={onPick} every={!!filter} />
      {empty ? <div className="usage-line">No sessions this week{filter ? ` in ${filter}` : ""}.</div> : (
        <>
          <UsageTable rows={cuts[cut] ?? []} cut={cut} setCut={setCut} sessions={data.sessions ?? []} />
          <UsageSessions key={data.week + (filter ?? "")} sessions={sessions} />
        </>
      )}
    </>
  );
}

/** `‹ This week · 6–12 Oct ›`: the arrows move a week, the label opens
 *  every recorded week. Nothing before the first recorded week, nothing
 *  after this one. */
function WeekPicker({ data, thisWeek, onPick }: { data: UsageData; thisWeek: string; onPick: (w: string) => void }) {
  const [open, setOpen] = useState(false);
  const label = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const first = data.weeks?.length ? data.weeks[data.weeks.length - 1].week : data.week;
  const point: WeekPoint = data.history?.find((p) => p.week === data.week) ?? { week: data.week, start: data.this_week.start, money: 0, tokens: 0, sessions: 0 };
  // An arrow that disables itself on the press hands focus to the label
  // first, so the keyboard stays on the picker (FR-5a, UI4).
  const step = (n: number) => {
    const w = shiftWeek(data.week, n);
    if (w <= first || w >= thisWeek) label.current?.focus();
    onPick(w);
  };
  const close = useCallback((back: boolean) => { setOpen(false); if (back) label.current?.focus(); }, []);
  useEffect(() => {
    if (!open) return;
    (list.current?.querySelector<HTMLButtonElement>("[aria-current=true]") ?? list.current?.querySelector<HTMLButtonElement>("button"))?.focus();
    const away = (e: MouseEvent) => { if (!list.current?.contains(e.target as Node) && e.target !== label.current) close(false); };
    document.addEventListener("mousedown", away);
    return () => document.removeEventListener("mousedown", away);
  }, [open, close]);
  const onKey = (e: KeyboardEvent) => {
    if (e.key === "Escape") { e.stopPropagation(); close(true); return; }
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    e.preventDefault();
    const items = [...(list.current?.querySelectorAll<HTMLButtonElement>("button") ?? [])];
    const i = items.indexOf(document.activeElement as HTMLButtonElement);
    items[Math.max(0, Math.min(items.length - 1, i + (e.key === "ArrowDown" ? 1 : -1)))]?.focus();
  };
  return (
    <span className="week-picker">
      <button className="ghost icon" onClick={() => step(-1)} disabled={data.week <= first} aria-label="The week before" title="The week before"><ChevronLeft size={14} /></button>
      <button ref={label} className="ghost week-label num" onClick={() => setOpen(!open)} aria-expanded={open} aria-haspopup="true" title="Pick a recorded week">{weekLabel(point, thisWeek)}</button>
      <button className="ghost icon" onClick={() => step(1)} disabled={data.week >= thisWeek} aria-label="The week after" title="The week after"><ChevronRight size={14} /></button>
      {open && (
        <div className="week-list" ref={list} role="menu" aria-label="recorded weeks" onKeyDown={onKey}>
          {!(data.weeks ?? []).some((w) => w.week === thisWeek) && (
            <button role="menuitem" className="num" aria-current={data.week === thisWeek} onClick={() => { onPick(thisWeek); close(true); }}>
              <span>This week</span><span className="wl-money">{money(0)}</span>
            </button>
          )}
          {(data.weeks ?? []).map((w) => (
            <button key={w.week} role="menuitem" className="num" aria-current={w.week === data.week} onClick={() => { onPick(w.week); close(true); }}>
              <span>{w.week === thisWeek ? "This week" : weekDays(w)}</span><span className="wl-money" title={unknownMoney(w) ? unknownWords(w.sessions) : undefined}>{moneyOf(w)}</span>
            </button>
          ))}
        </div>
      )}
    </span>
  );
}
