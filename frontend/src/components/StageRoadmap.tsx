import type { merge, model } from "../../wailsjs/go/models";
import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { useBoard } from "../stores/board.store";
import { DAY, parseISO } from "../lib/dates";
import { addLocalDays, startOfDay } from "../lib/axis";
import { cardBar } from "../lib/cardBar";
import { stageFocusIndex } from "../lib/stageFocus";
import {
  STEPS, STEP_WORDS, gateKey, gemsOf, outlineRows, parentKey, roundSegments, rowAfter, stageDecisions, stageGeometry, stepAfter, waveSpan,
  type OutlineRow, type Step,
} from "../lib/outline";
import { TimeFrame, ZoomControl, useTimeZoom } from "./TimeZoom";
import { OutlineRowView, type OutlineCtx } from "./OutlineRows";
import "../styles/roadmap.css";
import "../styles/outline.css";

export { gateKey };

/** An initiative's decision records keyed by gateKey of their number. */
export const recordsByGate = (decisions: model.Decision[] | undefined) =>
  new Map((decisions ?? []).map((d) => [gateKey(d.number), d]));

/** Where undated stages start, as a share of the lane, and the widest one slot
 *  may take. Undated stages are only order: equal slots after the last date. */
const SLOT_MAX = 16;
const SLOT_ROOM = 42;

/** Roadmap › Stages as an outline over the shared time axis
 *  (docs/ux/specs/roadmap-as-a-plan.md; build spec FR-4): stage rows with
 *  summary bars and their decisions as diamonds, waves under them, each
 *  wave's Rounds row and cards, and `Outside any stage` last. The Detail
 *  switch (four steps, cumulative) opens on Current stage every time and is
 *  not remembered; a chevron opens its row one step deeper and the switch
 *  resets the chevrons. Zoom and step are independent. */
export function StageRoadmap({ initiative, head }: { initiative: merge.BoardInitiative; head?: ReactNode }) {
  const { view, stageFocus, clearStageFocus, select, openDecision, widthClass } = useBoard();
  const [step, setStepRaw] = useState<Step>(1);
  const [open, setOpen] = useState<Map<string, boolean>>(new Map());
  const [active, setActive] = useState<string | null>(null);
  const focusNext = useRef<string | null>(null);
  const labels = useRef(new Map<string, HTMLElement>());
  const setStep = (s: Step) => { setStepRaw(s); setOpen(new Map()); };
  // Another initiative opens on step 1 again, as a remount does.
  useEffect(() => { setStepRaw(1); setOpen(new Map()); setActive(null); }, [initiative.id]);

  const stages = initiative.stages ?? [];
  const waves = initiative.waves ?? [];
  const cards = useMemo(() => Object.values(view?.board.columns ?? {}).flat()
    .filter((c) => c.initiative_id === initiative.id && c.machine === initiative.machine), [view, initiative.id, initiative.machine]);
  const bySlug = useMemo(() => new Map(cards.map((c) => [c.slug, c])), [cards]);

  // A stage tile in the header lands here (initiative-header FR-4, FR-18):
  // that stage is drawn (step 1 when it is the current one, else 2), opened
  // one step deeper, and its row takes focus.
  useEffect(() => {
    if (!stageFocus?.startsWith(`${initiative.id}/`)) return;
    const k = stageFocusIndex(stageFocus, initiative.id, stages.length);
    if (k !== null) {
      setStepRaw(stages[k]?.current ? 1 : 2);
      setOpen(new Map([[`stage:${k}`, true]]));
      focusNext.current = `stage:${k}`;
      setActive(`stage:${k}`);
    }
    clearStageFocus();
  }, [stageFocus, initiative.id, stages, clearStageFocus]);

  const nowMs = Date.now();
  const today = startOfDay(nowMs);
  const rows = outlineRows({ stages, waves, cards }, stages.length === 0 ? 1 : step, open);
  const geo = stageGeometry(stages, initiative.decisions, today);
  const showGems = step >= 2;

  // Undated slots for the stage rows drawn, in roadmap order.
  const slotOf = new Map<number, number>();
  for (const r of rows) if (r.kind === "stage" && geo[r.index].slot >= 0) slotOf.set(r.index, slotOf.size);
  const slots = slotOf.size;

  // Every drawn row's extent: the axis fits the rows on screen (step 1: the
  // current stage's span), and Hours is offered once a wave or round with a
  // time is drawn (0070).
  const extentOf = (r: OutlineRow): { from: number; to: number } | null => {
    const span = (ds: number[]) => (ds.length ? { from: Math.min(...ds), to: Math.max(...ds) } : null);
    if (r.kind === "stage") {
      const g = geo[r.index];
      const ds: number[] = [];
      if (g.start !== null && (g.end !== null || g.toToday)) ds.push(g.start);
      if (g.end !== null) ds.push(g.end, addLocalDays(g.end, 1));
      if (g.toToday) ds.push(addLocalDays(today, 1));
      if (showGems) for (const d of stageDecisions(stages, r.index, initiative.decisions)) for (const gm of gemsOf(d)) ds.push(gm.at, addLocalDays(gm.at, 1));
      return span(ds);
    }
    if (r.kind === "exit") {
      const met = parseISO(stages[r.index].exit?.[r.k]?.met)?.getTime();
      return met === undefined ? null : { from: met, to: addLocalDays(met, 1) };
    }
    if (r.kind === "wave") { const s = waveSpan(r.wave, nowMs); return s && { from: s.from, to: s.timed ? s.to : addLocalDays(s.to - 1, 1) }; }
    if (r.kind === "rounds") return span(roundSegments(r.wave, nowMs).flatMap((s) => [s.from, s.to]));
    if (r.kind === "card") {
      const c = bySlug.get(r.slug);
      if (!c) return null;
      const b = cardBar(c, today);
      const to = b.openEnded ? addLocalDays(today, 1) : b.end.timed ? b.end.at : addLocalDays(b.end.at, 1);
      return { from: b.start.at, to: Math.max(to, b.start.at) };
    }
    if (r.kind === "outside") return outsideExtent(rows, r, extentOf);
    return null;
  };
  const extents = new Map(rows.map((r) => [r.key, extentOf(r)]));
  const hours = rows.some((r) => (r.kind === "wave" && !r.wave.dot && !!waveSpan(r.wave, nowMs)?.timed) || (r.kind === "rounds" && roundSegments(r.wave, nowMs).length > 0));
  const all = [...extents.values()].filter((e): e is { from: number; to: number } => !!e);
  const dataFrom = Math.min(today, ...all.map((e) => e.from));
  const dataTo = Math.max(addLocalDays(today, 1), ...all.map((e) => e.to));
  const spanDays = Math.max((dataTo - dataFrom) / DAY, 21);
  const fit = { from: addLocalDays(dataFrom, -Math.max(2, Math.round(spanDays * 0.04))), to: addLocalDays(dataTo, Math.max(3, Math.round(spanDays * 0.06))) };
  const slot = slots ? Math.min(SLOT_MAX, SLOT_ROOM / slots) : 0;
  const z = useTimeZoom({ fit, data: { from: dataFrom, to: Math.max(dataTo, nowMs) }, hours, reserveFrac: (slot * slots) / 100, reset: initiative.id });

  // Focus follows the keyboard to the row it moved to, once that row has
  // mounted (a chevron may have just drawn it).
  const keys = rows.map((r) => r.key);
  const current = active && keys.includes(active) ? active : keys[0] ?? null;
  useEffect(() => {
    const k = focusNext.current;
    if (!k) return;
    const el = labels.current.get(k);
    if (!el) return;
    focusNext.current = null;
    el.focus({ preventScroll: true });
    el.scrollIntoView({ block: "nearest" });
  });

  const toggle = (key: string, to: boolean) => setOpen((m) => new Map(m).set(key, to));
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.metaKey || e.ctrlKey || e.altKey || !current) return;
    const row = rows.find((r) => r.key === current);
    if (!row) return;
    const k = e.key;
    let to: string | null = null;
    const expandable = row.kind === "stage" || row.kind === "outside" || row.kind === "wave";
    if (k === "ArrowDown" || k === "ArrowUp" || k === "Home" || k === "End") to = rowAfter(keys, current, k);
    else if (k === "ArrowRight") {
      if (expandable && !row.open) toggle(row.key, true);
      else if (expandable) to = rowAfter(keys, current, "ArrowDown");
    } else if (k === "ArrowLeft") {
      if (expandable && row.open) toggle(row.key, false);
      else to = parentKey(rows, current);
    } else if (k === "Enter" && row.kind === "card") {
      const c = bySlug.get(row.slug);
      if (c) select(c);
    } else return;
    e.preventDefault();
    e.stopPropagation(); // the frame's own arrows pan; here they move rows
    if (to) { focusNext.current = to; setActive(to); }
  };

  const short = widthClass === "compact";
  const detail = stages.length > 0 && (
    <DetailSwitch step={step} short={short} onStep={setStep} />
  );
  const toolbar = (
    <div className="tz-head ol-head">
      <div className="ol-switches">{head}{detail}</div>
      {rows.length > 0 && <ZoomControl z={z} />}
    </div>
  );

  if (stages.length === 0 && rows.length === 0) {
    return (
      <>
        {head}
        <NoRoadmap />
      </>
    );
  }

  // Undated stages keep their Fit width after the window's end at any level.
  const slotPx = slots ? z.reserve / slots : 0;
  const ctx: OutlineCtx = {
    z, initiative, stages, geo, bySlug, now: nowMs, today, showGems,
    slotLeft: (i) => z.scale.width + i * slotPx, slotW: slotPx, slotOf,
    extentOf: (k) => extents.get(k) ?? null,
    toggle, openDecision, select,
    active: current, setActive,
    labelRef: (k, el) => { if (el) labels.current.set(k, el); else labels.current.delete(k); },
  };

  return (
    <>
      {toolbar}
      {stages.length === 0 && <NoRoadmap />}
      <div className="srm ol">
        <TimeFrame z={z} label="Stages outline" undated={slots > 0 ? "no dates · order only" : undefined} extents={all}>
          <div role="tree" aria-label="Stages, waves, rounds and cards" onKeyDown={onKeyDown}>
            {rows.map((r) => <OutlineRowView key={r.key} r={r} ctx={ctx} />)}
          </div>
        </TimeFrame>
        <div className="srm-foot ol-foot">
          <span><i className="ol-key sum done" /> stage done</span>
          <span><i className="ol-key sum current" /> stage now, to today</span>
          <span><i className="ol-key planned" /> no target: order and appetite, no date</span>
          {step >= 2 && <span><i className="ol-gem-key waiting" /> decision raised</span>}
          {step >= 2 && <span><i className="ol-gem-key ruled" /> decision ruled</span>}
          {step >= 3 && <span><i className="ol-key wave" /> wave, launch to merge</span>}
          {step >= 4 && <span><i className="ol-key fail" />✕ failed round</span>}
        </div>
      </div>
    </>
  );
}

/** The outside row's extent: what the rows drawn under it span. Shut (steps
 *  1 and 2) it has none, so it never widens step 1's axis off the current
 *  stage, and its bracket shows once it is open. */
function outsideExtent(rows: OutlineRow[], r: OutlineRow, extentOf: (r: OutlineRow) => { from: number; to: number } | null) {
  const i = rows.indexOf(r);
  const inner = rows.slice(i + 1).map(extentOf).filter((e): e is { from: number; to: number } => !!e);
  return inner.length ? { from: Math.min(...inner.map((e) => e.from)), to: Math.max(...inner.map((e) => e.to)) } : null;
}

function NoRoadmap() {
  return (
    <div className="srm-empty">
      <p>No roadmap yet.</p>
      <p className="meta">Stages come from <span className="mono">working-on/roadmap.yaml</span>; the roadmapping skill says how to cut them.</p>
    </div>
  );
}

/** The Detail switch: a segmented radio group named Detail, the step
 *  applied at once, arrows move it (and apply), the words short in a
 *  narrow window. */
function DetailSwitch({ step, short, onStep }: { step: Step; short: boolean; onStep: (s: Step) => void }) {
  const refs = useRef(new Map<Step, HTMLButtonElement>());
  const onKeyDown = (e: KeyboardEvent) => {
    const to = stepAfter(step, e.key);
    if (!to) return;
    e.preventDefault();
    onStep(to);
    refs.current.get(to)?.focus();
  };
  return (
    <div className="seg ol-detail" role="radiogroup" aria-label="Detail" onKeyDown={onKeyDown}>
      {STEPS.map((s) => (
        <button key={s} ref={(el) => { if (el) refs.current.set(s, el); else refs.current.delete(s); }}
          role="radio" aria-checked={step === s} tabIndex={step === s ? 0 : -1} className={step === s ? "on" : ""}
          aria-label={STEP_WORDS[s].long} title={STEP_WORDS[s].long}
          onClick={() => onStep(s)}>
          {short ? STEP_WORDS[s].short : STEP_WORDS[s].long}
        </button>
      ))}
    </div>
  );
}
