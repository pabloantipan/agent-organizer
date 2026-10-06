import { isValidElement, useCallback, useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent, type MouseEvent, type ReactNode } from "react";
import { flushSync } from "react-dom";
import {
  GUTTER, HOUR, LABEL_GAP, LABEL_W, LEVEL_WORD, PX_HOUR, REVEAL_MARGIN, TICK_GAP, anchorScroll, axisGrowth, buttonAnchor, clampScroll, contextAt, dayMonth, deeper, fitIsWeekly,
  focusAfter, keptBy, overlaps, raised, revealScroll, scaleOf, seriesIndex, shallower, shiftInside, sideOf, skipStep, stackTitles, startOfDay,
  addLocalDays, rowInView, stepOf, ticksOf, todayAt, todayLabel, todayScroll, todayTick, windowOf,
  type Box, type Level, type Scale, type Span, type ZoomButton,
} from "../lib/axis";
import { dateWords } from "../lib/dates";
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
  const keptRow = useRef<{ el: HTMLElement; top: number } | null>(null);
  const gesture = useRef({ done: false, acc: 0, timer: 0 as unknown as ReturnType<typeof setTimeout> });

  useEffect(() => { setLevel("fit"); }, [o.reset]);
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 15000);
    return () => clearInterval(t);
  }, []);
  // leftovers-7 FR-11 (U3): a frame mounted again (its section closed and
  // reopened) keeps the level and goes back to the scroll it had, so the
  // ticks drawn around scrollX are the ones in view; the browser clamps a
  // scroll the lane no longer has, and scrollX follows what it kept.
  const lastX = useRef(0);
  lastX.current = scrollX;
  useLayoutEffect(() => {
    if (!frameEl) return;
    if (frameEl.scrollLeft !== lastX.current) frameEl.scrollLeft = lastX.current;
    setScrollX(frameEl.scrollLeft);
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
    // U1: the row the lead zoomed on stays at the height it had on screen,
    // though the zoomed frame becomes its own scroller (or stops being one).
    const keep = keptRow.current;
    keptRow.current = null;
    if (keep && keep.el.isConnected) keepRowAt(keep.el, keep.top);
    setScrollX(f.scrollLeft);
  }, [level, laneW]);

  const left = () => el.current?.scrollLeft ?? 0;
  /** Which row a level change keeps in place: the one given (a wave
   *  double-clicked, the row under the pointer), else the first row in view. */
  const keepRow = (row?: HTMLElement | null) => {
    const r = row ?? (el.current ? firstRowInView(el.current) : null);
    keptRow.current = r ? { el: r, top: r.getBoundingClientRect().top } : null;
  };
  const zoomTo = (next: Level | null, anchor?: { at: number; offset: number }, row?: HTMLElement | null) => {
    if (!next || next === level) return;
    keepRow(row);
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
    zoomIn: (anchor?: { at: number; offset: number }, row?: HTMLElement | null) => zoomTo(deeper(level, o.hours), anchor, row),
    zoomOut: (anchor?: { at: number; offset: number }, row?: HTMLElement | null) => zoomTo(shallower(level), anchor, row),
    fit: () => zoomTo("fit"),
    today: () => { if (level !== "fit") scrollTo(todayScroll(scale, now, reserve, view)); },
    pan: (px: number) => scrollTo(left() + px),
    /** Zooms to fit a span (a wave's bar, double-clicked): Hours where it is
     *  offered and the span holds in the lane, else Days, centred on it. */
    fitTo: (from: number, to: number, row?: HTMLElement | null) => {
      const next: Level = o.hours && ((to - from) * PX_HOUR) / HOUR <= view - 2 * REVEAL_MARGIN ? "hours" : "days";
      const s = scaleFor(next);
      const x = clampScroll((s.x(from) + s.x(to)) / 2 - view / 2, s, reserve, view);
      if (next === level) { if (el.current) el.current.scrollLeft = x; return; }
      keepRow(row);
      pending.current = x;
      setLevel(next);
    },
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
    const step = (dir: number, clientX?: number, clientY?: number) => {
      if (g.done) return;
      g.done = true;
      const a = clientX === undefined ? undefined : pointerRef.current(clientX);
      const row = clientX === undefined || clientY === undefined ? null : rowAt(f, clientX, clientY);
      if (dir > 0) live.current.zoomIn(a, row); else live.current.zoomOut(a, row);
    };
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        settle();
        g.acc += e.deltaY;
        if (Math.abs(g.acc) >= 4) step(g.acc < 0 ? 1 : -1, e.clientX, e.clientY);
        return;
      }
      if (e.shiftKey && levelRef.current !== "fit") {
        e.preventDefault();
        f.scrollLeft += e.deltaX || e.deltaY;
      }
    };
    type GestureLike = Event & { scale?: number; clientX?: number; clientY?: number };
    const onGestureStart = (e: Event) => { e.preventDefault(); g.done = false; };
    const onGestureChange = (e: Event) => {
      e.preventDefault();
      const s = (e as GestureLike).scale ?? 1;
      if (s > 1.08) step(1, (e as GestureLike).clientX, (e as GestureLike).clientY);
      else if (s < 0.92) step(-1, (e as GestureLike).clientX, (e as GestureLike).clientY);
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

/** The graph's rows, not the axis row. */
const rowsOf = (frame: HTMLElement) => Array.from(frame.querySelectorAll<HTMLElement>(".tz-row:not(.tz-axis-row)"));

/** The row under a point in the frame, if any (pinch and ⌘+wheel). */
function rowAt(frame: HTMLElement, x: number, y: number): HTMLElement | null {
  const r = rowsOf(frame).find((e) => { const b = e.getBoundingClientRect(); return y >= b.top && y < b.bottom; });
  return r ?? (document.elementFromPoint(x, y)?.closest<HTMLElement>(".tz-row:not(.tz-axis-row)") ?? null);
}

/** The first row whose body is in view: below the axis (which sticks) and
 *  the window's top (the buttons and keys zoom). */
function firstRowInView(frame: HTMLElement): HTMLElement | null {
  const axis = frame.querySelector<HTMLElement>(".tz-axis-row")?.getBoundingClientRect().bottom ?? 0;
  const rows = rowsOf(frame);
  const i = rowInView(rows.map((e) => { const b = e.getBoundingClientRect(); return { top: b.top, bottom: b.bottom }; }), Math.max(axis, frame.getBoundingClientRect().top, 0));
  return i < 0 ? null : rows[i];
}

/** Scrolls the row's scrollers, nearest first, until the row's top is back
 *  at `top` on screen, as far as each scroller allows. */
function keepRowAt(row: HTMLElement, top: number) {
  for (let s = row.parentElement; s; s = s.parentElement) {
    const d = row.getBoundingClientRect().top - top;
    if (Math.abs(d) < 1) return;
    const st = getComputedStyle(s);
    if (!/(auto|scroll)/.test(st.overflowY) || s.scrollHeight <= s.clientHeight) continue;
    s.scrollTop += d;
  }
  const d = row.getBoundingClientRect().top - top;
  if (Math.abs(d) >= 1) document.scrollingElement?.scrollBy(0, d);
}

/** `[-] level [+]  Today  Fit`, the same on every graph and at every level
 *  (§A1.1): nothing mounts or unmounts, so the control keeps its width; a
 *  button that cannot act here is disabled, and when the one just pressed
 *  disables, focus moves to the opposite zoom button first, in the same tick
 *  and before the level changes, so WebKit keeps the ring on it (design
 *  system, Focus and names). Where the opposite button is itself still
 *  disabled (Fit or `−` from the deepest level), the level commits
 *  synchronously and focus follows at once. A keyboard press also marks the
 *  target `tz-moved`, which draws the same ring in case WKWebView drops
 *  `:focus-visible` on a programmatic move; it goes with the focus. */
export function ZoomControl({ z, note }: { z: Zoom; note?: string }) {
  const word = LEVEL_WORD[z.level];
  const refs = useRef<Partial<Record<ZoomButton, HTMLButtonElement | null>>>({});
  const press = (e: MouseEvent, b: ZoomButton, next: Level | null, act: () => void) => {
    const to = next && next !== z.level ? focusAfter(b, next, z.hours) : null;
    const target = to ? refs.current[to] : null;
    if (!target) { act(); return; }
    const keyboard = e.detail === 0;
    const move = () => {
      target.focus({ preventScroll: true }); // U1: the kept row is measured after this
      if (keyboard) {
        target.classList.add("tz-moved");
        target.addEventListener("blur", () => target.classList.remove("tz-moved"), { once: true });
      }
    };
    if (!target.disabled) { move(); act(); return; }
    flushSync(act);
    move();
  };
  const fit = z.level === "fit";
  return (
    <div className="tz-ctl-wrap">
      {note && <span className="tz-note">{note}</span>}
      <div className="tz-ctl" role="group" aria-label={`Zoom, ${word}`}>
        <button ref={(e) => { refs.current.out = e; }} className="tz-icon" aria-label="Zoom out" title="Zoom out (−)" disabled={!z.canOut}
          onClick={(e) => press(e, "out", shallower(z.level), () => z.zoomOut())}>−</button>
        <span className="tz-level" aria-live="polite">{word}</span>
        <button ref={(e) => { refs.current.in = e; }} className="tz-icon" aria-label="Zoom in" title="Zoom in (+)" disabled={!z.canIn}
          onClick={(e) => press(e, "in", deeper(z.level, z.hours), () => z.zoomIn())}>+</button>
        <button ref={(e) => { refs.current.today = e; }} className="small" disabled={fit} onClick={() => z.today()} title="Today (t)">Today</button>
        <button ref={(e) => { refs.current.fit = e; }} className="small" disabled={fit} onClick={(e) => press(e, "fit", "fit", () => z.fit())} title="Fit (0)">Fit</button>
      </div>
    </div>
  );
}

/** Zoomed, the lane ends this much further right (and the foot as much
 *  lower, time-zoom.css), so a classic scrollbar covers no mark (row 13). */
const END_PAD = 12;

type FrameProps = {
  z: Zoom;
  label: string;              // what the chart is, for its accessible name
  axis?: ReactNode;           // the graph's own marks on the axis
  extents: Span[];            // each row's mark, for "No cards in this window."
  undated?: string;           // Stages: the label after the window's end
  children: ReactNode;        // the rows: .tz-row > .tz-label + .tz-lane
};

/** The scroll frame: a sticky label column and axis, the grid behind the
 *  rows (ticks, weekends, today), and the rows the graph draws. Its focus
 *  ring is drawn by the wrapper, outside the frame, so the sticky labels and
 *  axis never cover it (row 12). Zoomed, one background runs behind the
 *  whole label column, so nothing of the lane shows between the labels
 *  (row 11); it is measured to the content's height. */
export function TimeFrame({ z, label, axis, extents, undated, children }: FrameProps) {
  const [ring, setRing] = useState(false);
  const [contentEl, setContentEl] = useState<HTMLDivElement | null>(null);
  const [contentH, setContentH] = useState(0);
  useLayoutEffect(() => {
    if (!contentEl) return;
    setContentH(contentEl.offsetHeight);
    const ro = new ResizeObserver(() => setContentH(contentEl.offsetHeight));
    ro.observe(contentEl);
    return () => ro.disconnect();
  }, [contentEl]);
  const zoomed = z.level !== "fit";
  const s = z.scale;
  const ticks = zoomed ? ticksOf(s, z.scrollX - z.view, z.scrollX + 2 * z.view) : ticksOf(s);
  const xNow = s.x(z.now);
  const dayFrom = startOfDay(z.now);
  const nothing = zoomed && extents.length > 0 && extents.every((e) => z.side(e.from, e.to) !== null);
  // With today in view there is nowhere for Today to go (leftovers-6 FR-6):
  // the line names the graph's own things and drops the button.
  const todayInView = xNow >= z.scrollX && xNow <= z.scrollX + z.view;
  const noun = label.split(" ")[0].toLowerCase();
  const ctx = zoomed ? contextAt(s, z.scrollX) : "";
  const weekly = fitIsWeekly(s);
  const todayWord = todayLabel(z.level, z.now);
  // Every axis label is placed after it renders, on its rendered box: none is
  // cut and none overlaps (placeAxisLabels). Only when something that moves
  // one changed (leftovers-6 FR-7): a scroll, a resize, the level, the
  // lane, the time, the graph's own marks (their elements' signature), and
  // once the fonts are in, since they change every width. A render for
  // anything else (the agents feed, every 10 s) measures nothing.
  const [fonts, setFonts] = useState(0);
  useEffect(() => { document.fonts?.ready.then(() => setFonts((n) => n + 1)); }, []);
  const axisSig = sigOf(axis);
  useLayoutEffect(() => { if (contentEl) placeAxisLabels(contentEl, z.level); },
    [contentEl, contentH, fonts, axisSig, todayWord, ctx, undated, z.scrollX, z.level, z.frameW, z.laneW, z.view, z.reserve, xNow]);
  return (
    <div className={`tz-wrap ${ring ? "ring" : ""}`}>
    <div
      ref={z.frameRef}
      className={`tz-frame ${zoomed ? "zoomed" : ""} lvl-${z.level}`}
      tabIndex={0}
      onFocus={(e) => { if (e.target === e.currentTarget) setRing(focusVisible(e.currentTarget)); }}
      onBlur={(e) => { if (e.target === e.currentTarget) setRing(false); }}
      aria-label={`${label}, ${LEVEL_WORD[z.level]}. Plus and minus zoom, 0 fits, t goes to today, arrows pan.`}
      onKeyDown={z.onKeyDown}
      onScroll={z.onScroll}
    >
      {z.frameW > 0 && (
        <div ref={setContentEl} className="tz-content" style={{ width: LABEL_W + z.laneW + GUTTER + (zoomed ? END_PAD : 0), ["--tz-lane" as string]: `${z.laneW}px`, ["--tz-label-w" as string]: `${LABEL_W}px` }}>
          <div className="tz-grid" style={{ left: LABEL_W, width: z.laneW }} aria-hidden>
            {z.level === "days" && ticks.filter((t) => t.weekend).map((t) => <span key={`w${t.at}`} className="tz-weekend" style={{ left: t.x, width: t.width }} />)}
            {zoomed && <span className="tz-todayband" style={{ left: s.x(dayFrom), width: s.x(addLocalDays(dayFrom, 1)) - s.x(dayFrom) }} />}
            {ticks.map((t) => <span key={t.at} className={`tz-line ${t.major ? "" : "minor"}`} style={{ left: t.x }} />)}
            {z.reserve > 0 && <span className="tz-undated-edge" style={{ left: s.width }} />}
            {xNow >= 0 && xNow <= s.width && <span className="tz-today" style={{ left: xNow }} />}
          </div>
          {zoomed && <div className="tz-labelcol" aria-hidden><span style={{ height: contentH }} /></div>}
          <div className="tz-row tz-axis-row">
            <div className="tz-label tz-corner" />
            <div className="tz-axis" onDoubleClick={(e) => z.onAxisDoubleClick(e.clientX)} title={z.canIn ? "Double-click to zoom in here" : undefined}>
              {ticks.filter((t) => t.major && t.label).map((t) => (
                <span key={t.at} className={`tz-tick ${t.midnight ? "midnight" : ""} ${todayTick(t, z.level, z.now) ? "today" : ""}`} style={{ left: t.x, width: t.width }}><span data-k={seriesIndex(t, z.level, weekly)}>{t.label}</span></span>
              ))}
              {ticks.filter((t) => !t.major && t.label).map((t) => (
                <span key={t.at} className="tz-tick minor" style={{ left: t.x }}><span data-k={seriesIndex(t, z.level, weekly)}>{t.label}</span></span>
              ))}
              {z.reserve > 0 && undated && <span className="tz-undated-label" style={{ left: s.width }} title={undated}>{undated}</span>}
              {/* leftovers-7 FR-10: zoomed, the word sits on the context row,
                  centred over today's column (Days) or the line (Hours) */}
              {xNow >= 0 && xNow <= s.width && <span className={`tz-today-at ${zoomed ? "over" : ""}`} style={{ left: zoomed ? todayAt(s, z.now) : xNow }}><span className="tz-today-label">{todayWord}</span></span>}
              {axis}
              {ctx && <span className="tz-context" style={{ left: Math.max(z.scrollX, 0) }}>{ctx}</span>}
            </div>
          </div>
          {children}
          <div className="tz-foot" />
          {nothing && (
            <div className="tz-nothing" style={{ left: LABEL_W + z.scrollX + z.view / 2 }}>
              {todayInView
                ? <span>No {noun} in this window.</span>
                : <><span>Nothing in this window.</span><button className="small" onClick={() => z.today()}>Today</button></>}
            </div>
          )}
        </div>
      )}
    </div>
    </div>
  );
}

/** No axis text is cut, and none overlaps (design system, Timeline;
 *  leftovers-4 FR-11, leftovers-6 FR-4), decided on the rendered boxes. The
 *  room is the lane's visible stretch: from the label column's edge to the
 *  frame's inner right edge (a classic scrollbar's width is outside it),
 *  narrowed by any box between the label and the frame that clips it.
 *  - The today label (in the axis, beside its line) and the undated label
 *    are moved inside the room while their mark is in it; the today label
 *    first flips to the line's other side. One wider than the room, or
 *    whose mark is out of view, is hidden.
 *  - A mark's title (a milestone, the target) is never skipped: one that
 *    would overlap a label already placed stacks a row up, a row of its own
 *    text height at a time, up to TITLE_ROWS rows (stackTitles); the axis
 *    grows to hold the rows used (--tz-axis-grow), and the rest of a crowd
 *    fold into "+N" written on the top row's title, named in its hover and
 *    accessible name. Titles have the panel's ground and lie over the today
 *    line (time-zoom.css).
 *  - A tick label is never moved off its tick: one the room would cut is
 *    hidden; those that would sit closer than TICK_GAP (LABEL_GAP between
 *    Days' columns) skip one in two (skipStep), and one under a title, the today or the context label
 *    gives way.
 *  Every pass starts from what React drew, so nothing set here outlives the
 *  layout it was measured on; the axis's growth is kept and corrected, so a
 *  pass never shrinks the page under the reader. */
/** The day a mark stands on, read from its hover title's trailing
 *  `YYYY-MM-DD` (the Roadmap writes `<title> · <date>`); null without one. */
function dayOfMark(mark: Element | null): string | null {
  const m = /(\d{4}-\d{2}-\d{2})$/.exec(mark?.getAttribute("title") ?? "");
  return m ? m[1] : null;
}

/** A crowd's "+N" name (leftovers-8 FR-7): "2 more milestones on 24 Sep:
 *  Pilot, Billing", the days in words, each once. */
function moreName(rest: { name: string; kind: "milestone" | "date"; day: string | null }[]): string {
  const n = rest.length;
  const noun = rest.every((r) => r.kind === "milestone") ? (n === 1 ? "milestone" : "milestones") : (n === 1 ? "date" : "dates");
  const days = [...new Set(rest.map((r) => r.day).filter((d): d is string => !!d))].sort().map((d) => dateWords(d));
  const on = days.length ? ` on ${days.join(", ")}` : "";
  const names = rest.map((r) => r.name.trim()).filter(Boolean).join(", ");
  return `${n} more ${noun}${on}${names ? `: ${names}` : ""}`;
}

function placeAxisLabels(content: HTMLElement, level: Level) {
  const frame = content.parentElement;
  const axis = content.querySelector<HTMLElement>(".tz-axis");
  if (!frame || !axis) return;
  const f = frame.getBoundingClientRect();
  const lo = f.left + frame.clientLeft + LABEL_W;
  const hi = f.left + frame.clientLeft + frame.clientWidth;
  const ticks = Array.from(axis.querySelectorAll<HTMLElement>(":scope > .tz-tick > span"));
  const today = axis.querySelector<HTMLElement>(":scope > .tz-today-at > span");
  const undated = axis.querySelector<HTMLElement>(":scope > .tz-undated-label");
  const marks = Array.from(axis.querySelectorAll<HTMLElement>(".g-mark > span:not(.tz-more)"));
  const context = axis.querySelector<HTMLElement>(":scope > .tz-context");
  axis.querySelectorAll(".tz-more").forEach((e) => e.remove());
  const labels = [today, undated].filter((e): e is HTMLElement => !!e);
  for (const e of [...ticks, ...labels, ...marks]) { e.style.visibility = ""; e.style.transform = ""; }
  for (const e of marks) e.style.bottom = "";
  if (today) { today.style.left = ""; today.style.right = ""; }
  if (undated) undated.style.borderLeftColor = "";
  const grow = parseFloat(content.style.getPropertyValue("--tz-axis-grow")) || 0;
  const axisTop = axis.getBoundingClientRect().top;
  const hide = (e: HTMLElement) => { e.style.visibility = "hidden"; };
  const room = (e: HTMLElement) => {
    let [l, h] = [lo, hi];
    for (let a = e.parentElement; a && a !== frame; a = a.parentElement) {
      if (getComputedStyle(a).overflowX === "visible") continue;
      const r = a.getBoundingClientRect();
      l = Math.max(l, r.left + a.clientLeft); h = Math.min(h, r.left + a.clientLeft + a.clientWidth);
    }
    return [l, h] as const;
  };
  // A label's text box: what overlaps is the text, not a line box's leading
  // (and a Days label's span is its whole column). The today, undated and
  // context labels keep their own box, which their background or rule fills.
  const boxOf = (b: DOMRect): Box => ({ left: b.left, right: b.right, top: b.top, bottom: b.bottom });
  const text = (e: HTMLElement): Box => { const r = document.createRange(); r.selectNodeContents(e); return boxOf(r.getBoundingClientRect()); };
  const shift = (b: Box, dx: number): Box => ({ ...b, left: b.left + dx, right: b.right + dx });
  const shown: Box[] = context ? [boxOf(context.getBoundingClientRect())] : [];
  /** Moves a label inside its room, or hides it; its box, or null. */
  const inside = (e: HTMLElement, at: number): { dx: number; b: Box } | null => {
    const [l, h] = room(e);
    if (at < l || at > h) { hide(e); return null; }
    let b = boxOf(e.getBoundingClientRect());
    if (e === today && level === "fit" && b.right > h) {
      e.style.left = "auto"; e.style.right = "5px";
      b = boxOf(e.getBoundingClientRect());
    }
    const dx = shiftInside(b, l, h);
    if (dx === null) { hide(e); return null; }
    if (dx !== 0) e.style.transform = `translateX(${dx}px)`;
    return { dx, b: shift(b, dx) };
  };
  for (const e of labels) {
    const at = e === today ? e.parentElement!.getBoundingClientRect().left : e.getBoundingClientRect().left;
    const p = inside(e, at);
    if (!p) continue;
    if (p.dx !== 0 && e === undated) e.style.borderLeftColor = "transparent"; // the grid draws the edge
    if (shown.some((o) => overlaps(o, p.b))) { hide(e); continue; }
    shown.push(p.b);
  }
  // Titles left to right, so a stack moves the later of two; each centred
  // on its mark's glyph.
  const titles = marks
    .map((e) => { const g = e.parentElement!.getBoundingClientRect(); return { e, at: (g.left + g.right) / 2 }; })
    .sort((a, b) => a.at - b.at)
    .map(({ e, at }) => { const p = inside(e, at); return p ? { e, box: shift(text(e), p.dx), dx: p.dx } : null; })
    .filter((t): t is { e: HTMLElement; box: Box; dx: number } => !!t);
  const step = Math.ceil(Math.max(0, ...titles.map((t) => t.box.bottom - t.box.top)));
  const { row, into } = stackTitles(titles.map((t) => t.box), step, shown);
  const folded = new Map<number, HTMLElement[]>();
  const boxes: Box[] = [];
  const boxOfTitle = new Map<number, number>();
  titles.forEach((t, i) => {
    if (row[i] < 0) {
      hide(t.e);
      if (into[i] >= 0) folded.set(into[i], [...(folded.get(into[i]) ?? []), t.e]);
      return;
    }
    if (row[i] > 0) t.e.style.bottom = `${(parseFloat(getComputedStyle(t.e).bottom) || 0) + row[i] * step}px`;
    boxOfTitle.set(i, boxes.length);
    boxes.push(raised(t.box, row[i], step));
  });
  // The rest of a crowd: "+N" written on the crowd's last shown title, the
  // top row's (`Pilot opens · +1`), never a label of its own beside another
  // (design system, Timeline, 106a4bd; leftovers-7 FR-10). The title, now
  // longer, is moved back inside its room.
  const carried: { e: HTMLElement; at: number; l: number; k: number }[] = [];
  for (const [i, rest] of folded) {
    const t = titles[i];
    const more = document.createElement("span");
    more.className = "tz-more";
    more.textContent = ` · +${rest.length}`;
    // leftovers-8 FR-7: its own name, not text WKWebView reads as plain
    // ("+1"): "1 more milestone on 24 Sep: Billing switched on".
    more.title = moreName(rest.map((e) => ({ name: e.textContent ?? "", kind: e.parentElement?.classList.contains("ms") ? "milestone" : "date", day: dayOfMark(e.parentElement) })));
    more.setAttribute("role", "img");
    more.setAttribute("aria-label", more.title);
    t.e.appendChild(more);
    const [l, h] = room(t.e);
    let nb = boxOf(t.e.getBoundingClientRect());
    const at = t.dx + (shiftInside(nb, l, h) ?? 0);
    t.e.style.transform = at ? `translateX(${at}px)` : "";
    nb = boxOf(t.e.getBoundingClientRect());
    const k = boxOfTitle.get(i)!;
    carried.push({ e: t.e, at, l, k });
    boxes[k] = nb;
  }
  // The axis grows by what the highest title needs, and gives back what it
  // no longer does; titles hang from its foot, so they move down with it.
  const need = axisGrowth(boxes, axisTop, grow);
  const dy = need - grow;
  if (dy !== 0) content.style.setProperty("--tz-axis-grow", `${need}px`);
  const own = shown.length;
  for (const b of boxes) shown.push({ ...b, top: b.top + dy, bottom: b.bottom + dy });
  // A title carrying "+N" is longer: it keeps a floating label's 12 px from
  // what stands to its right on its own row (the today label, another title),
  // moving left where there is room. Measured live, after the growth, which
  // moves titles down onto the today label's row (leftovers-7 U1).
  for (const c of carried) {
    const self = own + c.k;
    const nb = boxOf(c.e.getBoundingClientRect());
    // its row: what crosses the title's middle line, not the row under it,
    // whose text box reaches a few px into this one
    const mid = (nb.top + nb.bottom) / 2;
    const others = shown.filter((o, j) => j !== self && o.top < mid && o.bottom > mid);
    const right = others.filter((o) => o.left >= nb.left && overlaps(o, nb, TICK_GAP));
    if (right.length === 0) continue;
    const by = Math.max(...right.map((o) => nb.right + TICK_GAP - o.left));
    const moved = shift(nb, -by);
    if (moved.left < c.l || others.some((o) => o.left < nb.left && overlaps(o, moved, LABEL_GAP))) continue;
    c.e.style.transform = `translateX(${c.at - by}px)`;
    shown[self] = moved;
  }
  const tickBoxes = ticks.map((e) => ({ e, b: text(e), k: Number(e.dataset.k), minor: !!e.closest(".minor") }));
  const whole = tickBoxes.filter(({ e, b }) => {
    const [l, h] = room(e);
    if (b.left >= l && b.right <= h) return true;
    hide(e);
    return false;
  });
  for (const minor of [false, true]) {
    const series = whole.filter((t) => t.minor === minor);
    // At Days each label is centred in its own day column, whose gridline
    // parts it from the next; 12 px there would drop every other day (A2),
    // so the columns keep LABEL_GAP (progress.md, choices).
    const k = skipStep(series.map((t) => ({ ...t.b, k: t.k })), level === "days" ? LABEL_GAP : TICK_GAP);
    for (const t of series) if (!keptBy(t.k, k) || shown.some((o) => overlaps(o, t.b))) hide(t.e);
  }
}

/** A cheap signature of a graph's axis marks: each element's key, class,
 *  title and style, and the text, so the labels are placed again when a
 *  mark moves or its title changes, and not otherwise. */
function sigOf(n: ReactNode): string {
  if (n === null || n === undefined || typeof n === "boolean") return "";
  if (typeof n === "string" || typeof n === "number") return String(n);
  if (Array.isArray(n)) return n.map(sigOf).join("|");
  if (isValidElement(n)) {
    const p = n.props as { children?: ReactNode; className?: string; title?: string; style?: object };
    return `<${n.key ?? ""} ${p.className ?? ""} ${p.title ?? ""} ${JSON.stringify(p.style ?? {})}>${sigOf(p.children)}`;
  }
  return "";
}

/** Whether a focus should show its ring: `:focus-visible` where the engine
 *  knows it (Safari 15.4 on), else every focus, as `:focus` would. */
function focusVisible(el: Element): boolean {
  try { return el.matches(":focus-visible"); } catch { return true; }
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
