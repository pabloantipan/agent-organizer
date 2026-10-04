import type { merge, model } from "../../wailsjs/go/models";
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { useBoard } from "../stores/board.store";
import { DAY, dateWords, daysBetween, parseISO, today } from "../lib/dates";
import { addLocalDays } from "../lib/axis";
import { stageFocusIndex } from "../lib/stageFocus";
import { PhaseWord } from "./InitiativeHeader";
import { EdgePointer, TimeFrame, ZoomControl, useTimeZoom, type Zoom } from "./TimeZoom";
import "../styles/roadmap.css";

/** A gate's key for finding its record (FR-5): a number compares by value, so
 *  `4`, `04` and `0004` all name record 0004, as the scan's check does. */
export function gateKey(n: string): string {
  const t = n.trim();
  return /^\d+$/.test(t) ? String(Number(t)) : t;
}

/** An initiative's decision records keyed by gateKey of their number. */
export const recordsByGate = (decisions: model.Decision[] | undefined) =>
  new Map((decisions ?? []).map((d) => [gateKey(d.number), d]));

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
export function StageRoadmap({ initiative, head }: { initiative: merge.BoardInitiative; head?: ReactNode }) {
  const { view, stageFocus, clearStageFocus } = useBoard();
  // One stage open at a time (initiative-header FR-4), by position: a broken
  // roadmap may repeat an id (a problem the scan reports). A stage tile in
  // the header lands here through stageFocus, which names the tile's
  // position (FR-18): that stage expands and takes focus, then the field
  // clears.
  const [expanded, setExpanded] = useState<number | null>(null);
  const [focusOn, setFocusOn] = useState<number | null>(null);
  const toggles = useRef(new Map<number, HTMLButtonElement>());
  useEffect(() => {
    if (!stageFocus?.startsWith(`${initiative.id}/`)) return;
    const k = stageFocusIndex(stageFocus, initiative.id, (initiative.stages ?? []).length);
    if (k !== null) { setExpanded(k); setFocusOn(k); }
    clearStageFocus();
  }, [stageFocus, initiative.id, initiative.stages, clearStageFocus]);
  const cards = Object.values(view?.board.columns ?? {}).flat()
    .filter((c) => c.initiative_id === initiative.id && c.machine === initiative.machine);
  const now = today();
  const stages = initiative.stages ?? [];
  const records = recordsByGate(initiative.decisions);
  // A stage id named by more than one stage (a problem the scan reports):
  // a card's `stage:` cannot say which, so neither row lists it (FR-5).
  const named = new Map<string, number>();
  for (const s of stages) named.set(s.id, (named.get(s.id) ?? 0) + 1);

  let slots = 0;
  let prevEnd: Date | null = null;
  const rows: Row[] = stages.map((s, i) => {
    const gates: Gate[] = (s.gates ?? []).map((id) => {
      const record = records.get(gateKey(id));
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

  // The dated region: every real date on the rows, and today; each date
  // covers its whole day. Stage dates never carry a time, so the zoom stops
  // at Days (A12).
  const dates: number[] = [now.getTime()];
  for (const r of rows) {
    if (r.start) dates.push(r.start.getTime());
    if (r.end) dates.push(r.end.getTime());
    for (const g of r.gates) { if (g.raised) dates.push(g.raised.getTime()); if (g.ruled) dates.push(g.ruled.getTime()); }
  }
  const dataFrom = Math.min(...dates);
  const dataTo = addLocalDays(Math.max(...dates), 1);
  const span = Math.max((dataTo - dataFrom) / DAY, 21);
  const fit = { from: addLocalDays(dataFrom, -Math.max(2, Math.round(span * 0.04))), to: addLocalDays(dataTo, Math.max(3, Math.round(span * 0.06))) };
  const slot = slots ? Math.min(SLOT_MAX, SLOT_ROOM / slots) : 0;
  const z = useTimeZoom({ fit, data: { from: dataFrom, to: Math.max(dataTo, Date.now()) }, hours: false, reserveFrac: (slot * slots) / 100, reset: initiative.id });

  // The rows mount only once the time frame has measured its width (frameW),
  // a render after the landing, so the focus waits for its toggle; the
  // effect runs again when either changes (leftovers-5 FR-6). The landing
  // brings the expanded detail into view as far as it fits, its toggle kept
  // at the top, under the sticky axis (FR-4), as the Decisions landing does.
  const frameW = z.frameW;
  useEffect(() => {
    if (focusOn === null) return;
    const el = toggles.current.get(focusOn);
    if (!el) return;
    el.scrollIntoView({ block: "nearest" });
    const detail = document.getElementById(el.getAttribute("aria-controls") ?? "");
    if (detail) showDetail(el, detail);
    el.focus({ preventScroll: true });
    setFocusOn(null);
  }, [focusOn, frameW]);

  if (rows.length === 0) {
    return (
      <>
        {head}
        <div className="srm-empty">
          <p>No roadmap yet.</p>
          <p className="meta">Stages come from <span className="mono">working-on/roadmap.yaml</span>; the roadmapping skill says how to cut them.</p>
        </div>
      </>
    );
  }

  // Undated stages keep their Fit width after the window's end at any level.
  const slotPx = slots ? z.reserve / slots : 0;
  const pos: Pos = {
    x: (d) => z.scale.x(d.getTime()),
    mid: (d) => (z.scale.x(d.getTime()) + z.scale.x(addLocalDays(d.getTime(), 1))) / 2,
    end: (d) => z.scale.x(addLocalDays(d.getTime(), 1)),
    slotLeft: (i) => z.scale.width + i * slotPx,
    slot: slotPx,
    pad: z.view * 0.006,
    nowEnd: z.scale.x(addLocalDays(now.getTime(), 1)),
  };

  return (
    <>
    {head !== undefined ? <div className="tz-head">{head}<ZoomControl z={z} /></div> : <div className="tz-head"><ZoomControl z={z} /></div>}
    <div className="srm">
      <TimeFrame z={z} label="Stages timeline" undated={slots > 0 ? "no dates · order only" : undefined} extents={rows.map(extentOf).filter((e): e is { from: number; to: number } => !!e)}>
        {rows.map((r, i) => (
          <StageRow key={i} r={r} now={now} pos={pos} z={z}
            initiative={initiative.id} cards={cards.filter((c) => c.stage === r.stage.id)} sharing={named.get(r.stage.id) ?? 1}
            open={expanded === i} onToggle={() => setExpanded(expanded === i ? null : i)}
            toggleRef={(el) => { if (el) toggles.current.set(i, el); else toggles.current.delete(i); }} />
        ))}
      </TimeFrame>
      <div className="srm-foot">
        <span><i className="srm-key done" /> stage done</span>
        <span><i className="srm-key current" /> stage now, to today</span>
        <span><i className="srm-key planned" /> no target: order and appetite, no date</span>
        <span><i className="srm-gem waiting inline" /> decision waiting, at raised</span>
        <span><i className="srm-gem ruled inline" /> decision ruled, at ruled</span>
      </div>
    </div>
    </>
  );
}

/** Scrolls the toggle's scroller so its stage's detail shows as far as it
 *  fits, never taking the toggle above the top of the view: the sticky axis
 *  when it sticks in that scroller, else the scroller's own top. */
function showDetail(toggle: HTMLElement, detail: HTMLElement) {
  let s = toggle.parentElement;
  while (s && !(/(auto|scroll)/.test(getComputedStyle(s).overflowY) && s.scrollHeight > s.clientHeight)) s = s.parentElement;
  if (!s) return;
  const view = s.getBoundingClientRect();
  const bottom = Math.min(view.bottom, window.innerHeight);
  const axis = toggle.closest(".srm")?.querySelector<HTMLElement>(".tz-axis-row");
  const floor = axis && getComputedStyle(axis).position === "sticky" ? Math.max(view.top, axis.getBoundingClientRect().bottom) : view.top;
  const over = detail.getBoundingClientRect().bottom - bottom;
  const room = toggle.getBoundingClientRect().top - floor;
  // leftovers-7 FR-6: a toggle the landing left under the stuck axis comes
  // down to just below it, so the axis and the stage are both in view.
  if (room < 0) { s.scrollTop += room; return; }
  const by = Math.min(over, room);
  if (by > 0) s.scrollTop += by;
}

/** Pixel positions on the shared axis: a day's start, middle and end. */
type Pos = { x: (d: Date) => number; mid: (d: Date) => number; end: (d: Date) => number; slotLeft: (i: number) => number; slot: number; pad: number; nowEnd: number };

/** A stage row's dated extent, for its edge pointer; undated rows have none. */
function extentOf(r: Row): { from: number; to: number } | null {
  const ds: number[] = [];
  if (r.start && (r.end || r.toToday)) ds.push(r.start.getTime());
  if (r.end) ds.push(r.end.getTime());
  if (r.toToday) ds.push(today().getTime());
  for (const g of r.gates) { if (g.record && g.raised) ds.push(g.raised.getTime()); if (g.record && g.ruled) ds.push(g.ruled.getTime()); }
  if (ds.length === 0) return null;
  return { from: Math.min(...ds), to: addLocalDays(Math.max(...ds), 1) };
}

function StageRow({ r, now, pos, z, initiative, cards, sharing, open, onToggle, toggleRef }: {
  r: Row; now: Date; pos: Pos; z: Zoom;
  initiative: string; cards: merge.BoardCard[]; sharing: number; open: boolean; onToggle: () => void; toggleRef: (el: HTMLButtonElement | null) => void;
}) {
  const s = r.stage;
  const missing = r.gates.filter((g) => !g.record).map((g) => g.id);
  const drawn = r.gates.filter((g) => g.record && g.raised);
  const appetite = s.appetite || "no appetite";
  // The stage word is "now" wherever a stage is drawn (initiative-header FR-14).
  const state = r.state === "done" ? "done" : r.state === "current" ? "now" : "";
  const sub = r.state === "done"
    ? `done ${dateWords(s.done)}`
    : s.target ? `target ${dateWords(s.target)}` : `appetite: ${appetite}`;

  // Stagger gate labels that would collide.
  const labels = drawn
    .map((g) => ({ g, at: pos.mid(g.ruled ?? (g.raised as Date)) }))
    .sort((a, b) => a.at - b.at);
  const lift = new Map<string, number>();
  let last = -1000;
  let row = 0;
  for (const l of labels) { row = l.at - last < 36 ? row + 1 : 0; lift.set(l.g.id, row % 2); last = l.at; }
  const ext = extentOf(r);
  // leftovers-9 FR-4: the row's name carries its dates as the bar draws
  // them, in words, else what the sub line says (appetite, no date).
  const span = r.end && r.start && daysBetween(r.start, r.end) >= 1
    ? `${dateWords(r.start)} to ${dateWords(r.end)}${r.state === "done" ? "" : ", target"}`
    : r.toToday && r.start ? `since ${dateWords(r.start)}` : sub;

  return (
    <>
    <div className={`srm-row tz-row ${r.state} ${open ? "expanded" : ""}`}>
      <button ref={toggleRef} className="srm-label srm-toggle tz-label" aria-expanded={open} aria-controls={`srm-detail-${r.n}`}
        aria-label={`Stage ${r.n}: ${s.title || s.id}${state ? `, ${state}` : ""}, ${span}. ${open ? "Hide" : "Show"} its detail`}
        onClick={onToggle}>
        <span className="srm-head">
          <span className="srm-n num">{r.n}{state && ` · ${state}`}</span>
          <PhaseWord phase={s.phase} />
        </span>
        <span className="srm-title" title={s.outcome || s.title || s.id}>{s.title || s.id}</span>
        <span className="srm-sub num">{sub}</span>
        {missing.length > 0 && (
          <span className="srm-missing num">{missing.join(", ")} {missing.length === 1 ? "names" : "name"} no record, not drawn</span>
        )}
      </button>
      <div className="srm-lane tz-lane">
        {r.end && (
          r.start && daysBetween(r.start, r.end) >= 1 ? (
            <span className={`srm-bar ${r.state}`} style={{ left: pos.x(r.start), width: pos.end(r.end) - pos.x(r.start) }}
              title={`${s.title || s.id}: ${dateWords(r.start)} → ${dateWords(r.end)}${r.state === "done" ? " (done)" : " (target)"}`} />
          ) : (
            <span className={`srm-dot ${r.state}`} style={{ left: pos.mid(r.end) }}
              title={`${s.title || s.id}: ${r.state === "done" ? "done" : "target"} ${dateWords(r.end)}`} />
          )
        )}
        {r.toToday && r.start && (
          <span className="srm-bar current" style={{ left: pos.x(r.start), width: Math.max(pos.nowEnd - pos.x(r.start), 4) }}
            title={`${s.title || s.id}: since ${dateWords(r.start)}, in progress`} />
        )}
        {r.slot >= 0 && (
          <PlannedBar r={r} pos={pos} appetite={appetite}
            title={`${s.title || s.id}: no target. Sized by order only; appetite ${appetite}. No date is computed from it.`} />
        )}
        {drawn.map((g) => {
          const d = g.record as model.Decision;
          const tip = `${d.number} ${d.title}`;
          const raised = g.raised as Date;
          if (g.ruled) {
            return (
              <span key={g.id}>
                <span className="srm-link" style={{ left: pos.mid(raised), width: pos.mid(g.ruled) - pos.mid(raised) }} />
                <span className="srm-gem raised" style={{ left: pos.mid(raised) }} title={`${tip}\nraised ${dateWords(d.raised)}`} />
                <span className="srm-gem ruled" style={{ left: pos.mid(g.ruled) }} title={`${tip}\nruled ${dateWords(d.ruled)}${d.ruled_by ? ` by ${d.ruled_by}` : ""}${d.chosen ? `: ${d.chosen}` : ""}`} />
                <span className={`srm-gem-label num lift-${lift.get(g.id)}`} style={{ left: pos.mid(g.ruled) }}>{d.number}</span>
              </span>
            );
          }
          const age = daysBetween(raised, now);
          return (
            <span key={g.id}>
              <span className="srm-gem waiting" style={{ left: pos.mid(raised) }} title={`${tip}\nwaiting since ${dateWords(d.raised)}${d.owner ? ` on ${d.owner}` : ""}`} />
              <span className={`srm-gem-label waiting num lift-${lift.get(g.id)}`} style={{ left: pos.mid(raised) }}>{d.number} · {age}d</span>
            </span>
          );
        })}
        {ext && <EdgePointer z={z} from={ext.from} to={ext.to} />}
      </div>
    </div>
    {open && <div className="tz-pin" style={{ width: z.frameW || undefined }}><StageDetail id={`srm-detail-${r.n}`} r={r} initiative={initiative} cards={cards} sharing={sharing} appetite={appetite} /></div>}
    </>
  );
}

/** Gap between a bar and the text set beside it, as the due label's. */
const AFTER_GAP = 6;

/** An undated stage's dashed bar with its appetite (leftovers-5 FR-12,
 *  leftovers-6 row 13). The appetite sits inside when it fits whole;
 *  otherwise after the bar, as a card's due label does, or before it when
 *  the lane ends first. Never cut inside the bar. The text inside stays
 *  rendered, hidden, so its whole width is measured again whenever the bar
 *  or the text changes. */
function PlannedBar({ r, pos, appetite, title }: { r: Row; pos: Pos; appetite: string; title: string }) {
  const left = pos.slotLeft(r.slot) + pos.pad;
  const width = pos.slot - 2 * pos.pad;
  const inner = useRef<HTMLSpanElement>(null);
  const [beside, setBeside] = useState<number | null>(null);
  useLayoutEffect(() => {
    const el = inner.current;
    if (!el) return;
    const text = el.scrollWidth;
    if (text <= el.clientWidth) { setBeside(null); return; }
    // The room after the bar runs to the frame's inner edge, past the lane's
    // own end, as the due label's does; only past the frame does the text
    // go before the bar.
    const lane = el.closest<HTMLElement>(".srm-lane")?.getBoundingClientRect();
    const frame = el.closest<HTMLElement>(".tz-frame");
    const end = lane && frame ? frame.getBoundingClientRect().left + frame.clientWidth - lane.left : Infinity;
    const after = left + width + AFTER_GAP;
    setBeside(after + text <= end ? after : Math.max(0, left - AFTER_GAP - text));
  }, [appetite, left, width]);
  const outside: CSSProperties = {
    position: "absolute", top: 20, left: beside ?? 0, height: 16, display: "flex", alignItems: "center",
    padding: "0 var(--space-1)", fontSize: "var(--font-size-xs)", lineHeight: "var(--line-xs)", color: "var(--fg-muted)", whiteSpace: "nowrap",
  };
  return (
    <>
      <span className={`srm-bar planned ${r.state}`} style={{ left, width }} title={title}>
        <span ref={inner} className="srm-appetite" aria-hidden={beside !== null || undefined} style={beside !== null ? { visibility: "hidden" } : undefined}>{appetite}</span>
      </span>
      {beside !== null && <span className="srm-appetite-after" style={outside} title={title}>{appetite}</span>}
    </>
  );
}

/** A stage expanded (initiative-header FR-4, §5), in the anatomy of the
 *  design system's decision record expanded: the outcome, the exit items
 *  checked with their met date or open, the gates as record links, the
 *  cards that carry `stage:` this stage, the appetite and the target. */
function StageDetail({ id, r, initiative, cards, sharing, appetite }: { id: string; r: Row; initiative: string; cards: merge.BoardCard[]; sharing: number; appetite: string }) {
  const { openDecision, select } = useBoard();
  const s = r.stage;
  const exits = s.exit ?? [];
  return (
    <div id={id} className="srm-detail">
      <p className="srm-outcome">{s.outcome || <span className="missing">no outcome written</span>}</p>
      <div className="srm-dsec">
        <span className="lbl">Exit</span>
        {exits.length === 0 ? <span className="missing">no exit written</span> : (
          <ul className="srm-exits">
            {exits.map((x, k) => {
              const met = parseISO(x.met);
              return (
                <li key={k} className={met ? "met" : ""}>
                  <span className="srm-check" aria-hidden>{met ? "✓" : "○"}</span>
                  <span>{x.text}</span>
                  <span className="num meta">{met ? `met ${dateWords(x.met)}` : "open"}</span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      <div className="srm-dsec">
        <span className="lbl">Gates</span>
        {r.gates.length === 0 ? <span className="missing">none</span> : (
          <span className="srm-links">
            {r.gates.map((g) => g.record ? (
              <button key={g.id} className={`lz ${g.record.status === "proposed" ? "waiting" : ""}`} onClick={() => openDecision(initiative, g.record!.number)} title={g.record.title}>
                {g.record.number} · {g.record.status === "proposed" ? "waiting" : g.record.status}
              </button>
            ) : <span key={g.id} className="missing">{g.id} names no record</span>)}
          </span>
        )}
      </div>
      <div className="srm-dsec">
        <span className="lbl">Cards</span>
        {sharing > 1 ? <span className="missing">Cards can't be joined: {sharing === 2 ? "two" : sharing} stages are named "{s.id}".</span> : cards.length === 0 ? <span className="missing">no card carries stage: {s.id}</span> : (
          <span className="srm-links">
            {cards.map((c) => <button key={c.slug} className="linkish" onClick={() => select(c)} title={c.next || c.title}>{c.title || c.slug} <span className="meta">· {c.status}</span></button>)}
          </span>
        )}
      </div>
      <div className="srm-dsec">
        <span className="lbl">Appetite</span><span>{appetite}</span>
        {s.target && <><span className="lbl">Target</span><span className="num">{dateWords(s.target)}</span></>}
        {s.done && <><span className="lbl">Done</span><span className="num">{dateWords(s.done)}</span></>}
      </div>
    </div>
  );
}
