import { useCallback, useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import {
  GUTTER, LABEL_W, LEVEL_WORD, anchorScroll, buttonAnchor, clampScroll, contextAt, dayMonth, deeper, focusAfter, hhmm,
  revealScroll, scaleOf, shallower, sideOf, startOfDay, addLocalDays, stepOf, tickLabelWhole, ticksOf, todayScroll, windowOf,
  type Level, type Scale, type Span, type Tick, type ZoomButton,
} from "../lib/axis";
import "../styles/time-zoom.css";

/** The time zoom shared by Roadmap Cards, Roadmap Stages and the Decisions
 *  Timeline (docs/ux/specs/roadmap-time-zoom.md): the level as component
 *  state (T5: never the store, browser storage or the order document), the
 *  scroll frame with its sticky label column and axis, the grid behind the
 *  rows, the control, and the edge pointers. Each graph keeps its own rows
 *  and marks and places them with `z.scale.x`. */

export type ZoomOptions = {
  fit: Span;            // the graph's span as built, padding included
  data: Span;           // what Days and Hours window: every mark, and now
  hours: boolean;       // some mark carries a time (offersHours)
  reserveFrac?: number; // Stages: the undated region's share of the Fit lane
  reset?: unknown;      // back to Fit when this changes (the initiative)
};

export type Zoom = ReturnType<typeof useTimeZoom>;

export function useTimeZoom(o: ZoomOptions) {
  const el = useRef<HTMLDivElement | null>(null);
  const [frameEl, setFrameEl] = useState<HTMLDivElement | null>(null);
  const frameRef = useCallback((node: HTMLDivElement | null) => { el.current = node; setFrameEl(node); }, []);
  const raf = useRef(0);
  const [picked, setLevel] = useState<Level>("fit");
  const [frameW, setFrameW] = useState(0);
  const [scrollX, setScrollX] = useState(0);
  const [now, setNow] = useState(() => Date.now());
  const pending = useRef<number | null>(null);
  const gesture = useRef({ done: false, acc: 0, timer: 0 as unknown as ReturnType<typeof setTimeout> });

  useEffect(() => { setLevel("fit"); }, [o.reset]);
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 15000);
    return () => clearInterval(t);
  }, []);
  useLayoutEffect(() => {
    if (!frameEl) return;
    setFrameW(frameEl.clientWidth);
    const ro = new ResizeObserver(() => setFrameW(frameEl.clientWidth));
    ro.observe(frameEl);
    return () => ro.disconnect();
  }, [frameEl]);

  const level: Level = picked === "hours" && !o.hours ? "days" : picked;
  const view = Math.max(frameW - LABEL_W - GUTTER, 0);
  const reserve = Math.round((o.reserveFrac ?? 0) * view);
  const scaleFor = (l: Level): Scale => l === "fit"
    ? scaleOf("fit", o.fit, Math.max(view - reserve, 0))
    : scaleOf(l, windowOf(l, o.fit, o.data, view - reserve, now), 0);
  const scale = scaleFor(level);
  const laneW = scale.width + reserve;
  const deepest = deeper(level, o.hours) === null;

  useLayoutEffect(() => {
    const f = el.current;
    if (!f) return;
    if (pending.current !== null) {
      f.scrollLeft = pending.current;
      pending.current = null;
    }
    setScrollX(f.scrollLeft);
  }, [level, laneW]);

  const left = () => el.current?.scrollLeft ?? 0;
  const zoomTo = (next: Level | null, anchor?: { at: number; offset: number }) => {
    if (!next || next === level) return;
    const a = anchor ?? buttonAnchor(scale, left(), view, now);
    pending.current = next === "fit" ? 0 : anchorScroll(scaleFor(next), a.at, a.offset, reserve, view);
    setLevel(next);
  };
  const scrollTo = (x: number) => {
    if (el.current) el.current.scrollLeft = clampScroll(x, scale, reserve, view);
  };
  /** The instant under a pointer and its offset in the lane, if it is over it. */
  const pointer = (clientX: number) => {
    if (!el.current) return undefined;
    const offset = clientX - el.current.getBoundingClientRect().left - LABEL_W;
    if (offset < 0 || offset > view) return undefined;
    return { at: scale.at(left() + offset), offset };
  };
  const api = {
    zoomIn: (anchor?: { at: number; offset: number }) => zoomTo(deeper(level, o.hours), anchor),
    zoomOut: (anchor?: { at: number; offset: number }) => zoomTo(shallower(level), anchor),
    fit: () => zoomTo("fit"),
    today: () => { if (level !== "fit") scrollTo(todayScroll(scale, now, reserve, view)); },
    pan: (px: number) => scrollTo(left() + px),
  };
  const live = useRef(api);
  live.current = api;
  const levelRef = useRef(level);
  levelRef.current = level;
  const pointerRef = useRef(pointer);
  pointerRef.current = pointer;

  // Pinch (ctrl+wheel in Chromium, gesture events in WebKit) and ⌘+wheel move
  // one level per gesture; a plain wheel is never taken, shift+wheel pans.
  useEffect(() => {
    const f = frameEl;
    if (!f) return;
    const g = gesture.current;
    const settle = () => { clearTimeout(g.timer); g.timer = setTimeout(() => { g.done = false; g.acc = 0; }, 250); };
    const step = (dir: number, clientX?: number) => {
      if (g.done) return;
      g.done = true;
      const a = clientX === undefined ? undefined : pointerRef.current(clientX);
      if (dir > 0) live.current.zoomIn(a); else live.current.zoomOut(a);
    };
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        settle();
        g.acc += e.deltaY;
        if (Math.abs(g.acc) >= 4) step(g.acc < 0 ? 1 : -1, e.clientX);
        return;
      }
      if (e.shiftKey && levelRef.current !== "fit") {
        e.preventDefault();
        f.scrollLeft += e.deltaX || e.deltaY;
      }
    };
    type GestureLike = Event & { scale?: number; clientX?: number };
    const onGestureStart = (e: Event) => { e.preventDefault(); g.done = false; };
    const onGestureChange = (e: Event) => {
      e.preventDefault();
      const s = (e as GestureLike).scale ?? 1;
      if (s > 1.08) step(1, (e as GestureLike).clientX);
      else if (s < 0.92) step(-1, (e as GestureLike).clientX);
    };
    const onGestureEnd = (e: Event) => { e.preventDefault(); g.done = false; };
    f.addEventListener("wheel", onWheel, { passive: false });
    f.addEventListener("gesturestart", onGestureStart);
    f.addEventListener("gesturechange", onGestureChange);
    f.addEventListener("gestureend", onGestureEnd);
    return () => {
      f.removeEventListener("wheel", onWheel);
      f.removeEventListener("gesturestart", onGestureStart);
      f.removeEventListener("gesturechange", onGestureChange);
      f.removeEventListener("gestureend", onGestureEnd);
    };
  }, [frameEl]);

  const onScroll = () => {
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => setScrollX(left()));
  };
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const k = e.key;
    if (k === "+" || k === "=") api.zoomIn();
    else if (k === "-" || k === "_") api.zoomOut();
    else if (k === "0") api.fit();
    else if (k === "t" || k === "T") api.today();
    else if ((k === "ArrowLeft" || k === "ArrowRight") && level !== "fit") api.pan((k === "ArrowLeft" ? -1 : 1) * (e.shiftKey ? view : stepOf(level)));
    else return;
    e.preventDefault();
  };

  return {
    level, scale, laneW, reserve, view, frameW, scrollX, now, deepest, frameRef, hours: o.hours,
    canIn: !deepest, canOut: level !== "fit",
    ...api,
    onScroll, onKeyDown,
    onAxisDoubleClick: (clientX: number) => api.zoomIn(pointer(clientX)),
    /** Which side a mark lies wholly on, at Days and Hours. */
    side: (from: number, to: number) => (level === "fit" ? null : sideOf(scale, from, to, scrollX, view)),
    reveal: (from: number, to: number, side: "left" | "right") => scrollTo(revealScroll(scale, from, to, side, reserve, view)),
  };
}

/** `[-] level [+]  Today  Fit`, the same on every graph and at every level
 *  (§A1.1): nothing mounts or unmounts, so the control keeps its width; a
 *  button that cannot act here is disabled, and when the one just pressed
 *  disables, focus moves to the opposite zoom button, never to the body. */
export function ZoomControl({ z, note }: { z: Zoom; note?: string }) {
  const word = LEVEL_WORD[z.level];
  const refs = useRef<Partial<Record<ZoomButton, HTMLButtonElement | null>>>({});
  const focusNext = useRef<ZoomButton | null>(null);
  useLayoutEffect(() => {
    const b = focusNext.current;
    focusNext.current = null;
    if (b) refs.current[b]?.focus();
  }, [z.level]);
  const press = (b: ZoomButton, next: Level | null, act: () => void) => {
    if (next && next !== z.level) focusNext.current = focusAfter(b, next, z.hours);
    act();
  };
  const fit = z.level === "fit";
  return (
    <div className="tz-ctl-wrap">
      {note && <span className="tz-note">{note}</span>}
      <div className="tz-ctl" role="group" aria-label={`Zoom, ${word}`}>
        <button ref={(e) => { refs.current.out = e; }} className="tz-icon" aria-label="Zoom out" title="Zoom out (−)" disabled={!z.canOut}
          onClick={() => press("out", shallower(z.level), () => z.zoomOut())}>−</button>
        <span className="tz-level" aria-live="polite">{word}</span>
        <button ref={(e) => { refs.current.in = e; }} className="tz-icon" aria-label="Zoom in" title="Zoom in (+)" disabled={!z.canIn}
          onClick={() => press("in", deeper(z.level, z.hours), () => z.zoomIn())}>+</button>
        <button ref={(e) => { refs.current.today = e; }} className="small" disabled={fit} onClick={() => z.today()} title="Today (t)">Today</button>
        <button ref={(e) => { refs.current.fit = e; }} className="small" disabled={fit} onClick={() => press("fit", "fit", () => z.fit())} title="Fit (0)">Fit</button>
      </div>
    </div>
  );
}

type FrameProps = {
  z: Zoom;
  label: string;              // what the chart is, for its accessible name
  axis?: ReactNode;           // the graph's own marks on the axis
  extents: Span[];            // each row's mark, for "Nothing in this window."
  undated?: string;           // Stages: the label after the window's end
  children: ReactNode;        // the rows: .tz-row > .tz-label + .tz-lane
};

/** The scroll frame: a sticky label column and axis, the grid behind the
 *  rows (ticks, weekends, today), and the rows the graph draws. */
export function TimeFrame({ z, label, axis, extents, undated, children }: FrameProps) {
  const zoomed = z.level !== "fit";
  const s = z.scale;
  const ticks = zoomed ? ticksOf(s, z.scrollX - z.view, z.scrollX + 2 * z.view) : ticksOf(s);
  const xNow = s.x(z.now);
  const dayFrom = startOfDay(z.now);
  const nothing = zoomed && extents.length > 0 && extents.every((e) => z.side(e.from, e.to) !== null);
  // Fit keeps a tick's label clear of the undated edge's label (Stages).
  // and every label clear of the lane's right end.
  const labelled = (x: number) => x < z.laneW - 36 && (zoomed || !undated || x < s.width - 56);
  const ctx = zoomed ? contextAt(s, z.scrollX) : "";
  // Zoomed, a tick label shows only whole, between the label column and the
  // frame's right edge (§A1.6); the sticky context label covers the left.
  const whole = (t: Tick) => !zoomed || tickLabelWhole(t, z.level, z.scrollX, z.frameW - LABEL_W);
  const todayWord = z.level === "hours" ? `now ${hhmm(z.now)}` : "today";
  return (
    <div
      ref={z.frameRef}
      className={`tz-frame ${zoomed ? "zoomed" : ""} lvl-${z.level}`}
      tabIndex={0}
      aria-label={`${label}, ${LEVEL_WORD[z.level]}. Plus and minus zoom, 0 fits, t goes to today, arrows pan.`}
      onKeyDown={z.onKeyDown}
      onScroll={z.onScroll}
    >
      {z.frameW > 0 && (
        <div className="tz-content" style={{ width: LABEL_W + z.laneW + GUTTER, ["--tz-lane" as string]: `${z.laneW}px` }}>
          <div className="tz-grid" style={{ left: LABEL_W, width: z.laneW }} aria-hidden>
            {z.level === "days" && ticks.filter((t) => t.weekend).map((t) => <span key={`w${t.at}`} className="tz-weekend" style={{ left: t.x, width: t.width }} />)}
            {zoomed && <span className="tz-todayband" style={{ left: s.x(dayFrom), width: s.x(addLocalDays(dayFrom, 1)) - s.x(dayFrom) }} />}
            {ticks.map((t) => <span key={t.at} className={`tz-line ${t.major ? "" : "minor"}`} style={{ left: t.x }} />)}
            {z.reserve > 0 && <span className="tz-undated-edge" style={{ left: s.width }} />}
            {xNow >= 0 && xNow <= s.width && <span className="tz-today" style={{ left: xNow }}><span>{todayWord}</span></span>}
          </div>
          <div className="tz-row tz-axis-row">
            <div className="tz-label tz-corner" />
            <div className="tz-axis" onDoubleClick={(e) => z.onAxisDoubleClick(e.clientX)} title={z.canIn ? "Double-click to zoom in here" : undefined}>
              {ticks.filter((t) => t.major && t.label && labelled(t.x) && whole(t)).map((t) => (
                <span key={t.at} className={`tz-tick ${t.midnight ? "midnight" : ""}`} style={{ left: t.x, width: t.width }}><span>{t.label}</span></span>
              ))}
              {ticks.filter((t) => !t.major && t.label && whole(t)).map((t) => (
                <span key={t.at} className="tz-tick minor" style={{ left: t.x }}><span>{t.label}</span></span>
              ))}
              {z.reserve > 0 && undated && <span className="tz-undated-label" style={{ left: s.width }}>{undated}</span>}
              {axis}
              {ctx && <span className="tz-context" style={{ left: Math.max(z.scrollX, 0) }}>{ctx}</span>}
            </div>
          </div>
          {children}
          <div className="tz-foot" />
          {nothing && (
            <div className="tz-nothing" style={{ left: LABEL_W + z.scrollX + z.view / 2 }}>
              <span>Nothing in this window.</span>
              <button className="small" onClick={() => z.today()}>Today</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/** A row's pointer to its mark when the mark lies wholly outside the window:
 *  `‹ 12 Sep` or `5 Oct ›`, a button that scrolls to it and keeps the level. */
export function EdgePointer({ z, from, to }: { z: Zoom; from: number; to: number }) {
  const side = z.side(from, to);
  if (!side) return null;
  // The nearest date: a mark on the left ends there, one on the right starts.
  const date = dayMonth(side === "left" ? Math.max(from, to - 1) : from);
  return (
    <button
      className={`tz-edge ${side}`}
      style={side === "left" ? { left: z.scrollX + 4 } : { left: z.scrollX + z.view - 4 }}
      onClick={(e) => { e.stopPropagation(); z.reveal(from, to, side); }}
      aria-label={`Scroll to ${date}`}
      title={`Scroll to ${date}`}
    >
      {side === "left" ? `‹ ${date}` : `${date} ›`}
    </button>
  );
}

/** A whole day at Hours (§A1.2): the status's band with a border in its
 *  colour, and the mark's dot inside it, pinned at the lane's visible left
 *  edge while the band crosses it (sticky within the band, so it returns to
 *  the band's start once that is in view). */
export function DayBand({ z, from, to, status, dot, title }: { z: Zoom; from: number; to: number; status: string; dot: string; title: string }) {
  const x = z.scale.x;
  return (
    <div className={`tz-band day ${status}`} style={{ left: x(from), width: x(to) - x(from) }} title={title}>
      <span className={`${dot} ${status} tz-pinned`} />
    </div>
  );
}
