import { useCallback, useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent, type MouseEvent, type ReactNode } from "react";
import { flushSync } from "react-dom";
import {
  GUTTER, LABEL_W, LEVEL_WORD, anchorScroll, buttonAnchor, clampScroll, contextAt, dayMonth, deeper, fitIsWeekly, focusAfter, hhmm,
  keptBy, overlaps, revealScroll, scaleOf, seriesIndex, shallower, shiftInside, sideOf, skipStep, startOfDay, addLocalDays, stepOf,
  ticksOf, todayScroll, windowOf,
  type Box, type Level, type Scale, type Span, type ZoomButton,
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
      target.focus();
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
  extents: Span[];            // each row's mark, for "Nothing in this window."
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
  const ctx = zoomed ? contextAt(s, z.scrollX) : "";
  const weekly = fitIsWeekly(s);
  // Every axis label is placed after it renders, on its rendered box: none is
  // cut and none overlaps (placeAxisLabels). After every render, since a
  // scroll, a resize, the level or a graph's own marks can each move one; and
  // once the fonts are in, since they change every width.
  const [, setFonts] = useState(0);
  useEffect(() => { document.fonts?.ready.then(() => setFonts((n) => n + 1)); }, []);
  useLayoutEffect(() => { if (contentEl) placeAxisLabels(contentEl); });
  const todayWord = z.level === "hours" ? `now ${hhmm(z.now)}` : "today";
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
        <div ref={setContentEl} className="tz-content" style={{ width: LABEL_W + z.laneW + GUTTER + (zoomed ? END_PAD : 0), ["--tz-lane" as string]: `${z.laneW}px` }}>
          <div className="tz-grid" style={{ left: LABEL_W, width: z.laneW }} aria-hidden>
            {z.level === "days" && ticks.filter((t) => t.weekend).map((t) => <span key={`w${t.at}`} className="tz-weekend" style={{ left: t.x, width: t.width }} />)}
            {zoomed && <span className="tz-todayband" style={{ left: s.x(dayFrom), width: s.x(addLocalDays(dayFrom, 1)) - s.x(dayFrom) }} />}
            {ticks.map((t) => <span key={t.at} className={`tz-line ${t.major ? "" : "minor"}`} style={{ left: t.x }} />)}
            {z.reserve > 0 && <span className="tz-undated-edge" style={{ left: s.width }} />}
            {xNow >= 0 && xNow <= s.width && <span className="tz-today" style={{ left: xNow }}><span>{todayWord}</span></span>}
          </div>
          {zoomed && <div className="tz-labelcol" aria-hidden><span style={{ height: contentH }} /></div>}
          <div className="tz-row tz-axis-row">
            <div className="tz-label tz-corner" />
            <div className="tz-axis" onDoubleClick={(e) => z.onAxisDoubleClick(e.clientX)} title={z.canIn ? "Double-click to zoom in here" : undefined}>
              {ticks.filter((t) => t.major && t.label).map((t) => (
                <span key={t.at} className={`tz-tick ${t.midnight ? "midnight" : ""}`} style={{ left: t.x, width: t.width }}><span data-k={seriesIndex(t, z.level, weekly)}>{t.label}</span></span>
              ))}
              {ticks.filter((t) => !t.major && t.label).map((t) => (
                <span key={t.at} className="tz-tick minor" style={{ left: t.x }}><span data-k={seriesIndex(t, z.level, weekly)}>{t.label}</span></span>
              ))}
              {z.reserve > 0 && undated && <span className="tz-undated-label" style={{ left: s.width }} title={undated}>{undated}</span>}
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
    </div>
  );
}

/** No axis text is cut, and none overlaps (design system, Timeline;
 *  leftovers-4 FR-11), decided on the rendered boxes. The room is the lane's
 *  visible stretch: from the label column's edge to the frame's inner right
 *  edge (a classic scrollbar's width is outside it).
 *  - A mark's title (a milestone, the target), the undated label and the
 *    today label are moved inside the room while their mark is in it; the
 *    today label first flips to the line's other side. One wider than the
 *    room, or whose mark is out of view, is hidden and left to the mark's
 *    hover title. Of two that overlap, the later one is hidden.
 *  - A tick label is never moved off its tick: one the room would cut is
 *    hidden; those that would overlap skip one in two (skipStep), and one
 *    under a mark's title or the sticky context label is hidden.
 *  Every pass starts from what React drew, so nothing set here outlives the
 *  layout it was measured on. */
function placeAxisLabels(content: HTMLElement) {
  const frame = content.parentElement;
  if (!frame) return;
  const f = frame.getBoundingClientRect();
  const lo = f.left + frame.clientLeft + LABEL_W;
  const hi = f.left + frame.clientLeft + frame.clientWidth;
  const ticks = Array.from(content.querySelectorAll<HTMLElement>(".tz-axis > .tz-tick > span"));
  const today = content.querySelector<HTMLElement>(".tz-grid > .tz-today > span");
  const undated = content.querySelector<HTMLElement>(".tz-axis > .tz-undated-label");
  const marks = Array.from(content.querySelectorAll<HTMLElement>(".tz-axis .g-mark > span"));
  const context = content.querySelector<HTMLElement>(".tz-axis > .tz-context");
  const placed = [today, undated, ...marks].filter((e): e is HTMLElement => !!e);
  for (const e of [...ticks, ...placed]) { e.style.visibility = ""; e.style.transform = ""; }
  if (today) { today.style.left = ""; today.style.right = ""; }
  if (undated) undated.style.borderLeftColor = "";
  const hide = (e: HTMLElement) => { e.style.visibility = "hidden"; };
  // A label's text box: what overlaps is the text, not a line box's leading
  // (and a Days label's span is its whole column). The today, undated and
  // context labels keep their own box, which their background or rule fills.
  const text = (e: HTMLElement) => { const r = document.createRange(); r.selectNodeContents(e); return r.getBoundingClientRect(); };
  const shown: Box[] = context ? [context.getBoundingClientRect()] : [];
  for (const e of placed) {
    // Where the mark itself is: the today line, the undated edge, a mark's
    // glyph (the label is centred on it).
    const at = e === today ? e.parentElement!.getBoundingClientRect().left
      : e === undated ? e.getBoundingClientRect().left
      : (() => { const g = e.parentElement!.getBoundingClientRect(); return (g.left + g.right) / 2; })();
    if (at < lo || at > hi) { hide(e); continue; }
    let b = e.getBoundingClientRect();
    if (e === today && b.right > hi) {
      e.style.left = "auto"; e.style.right = "5px";
      b = e.getBoundingClientRect();
    }
    const dx = shiftInside(b, lo, hi);
    if (dx === null) { hide(e); continue; }
    if (dx !== 0) {
      e.style.transform = `translateX(${dx}px)`;
      if (e === undated) e.style.borderLeftColor = "transparent"; // the grid draws the edge
      b = { left: b.left + dx, right: b.right + dx, top: b.top, bottom: b.bottom } as DOMRect;
    }
    const t = e === today || e === undated ? b : (() => { const r = text(e); return { left: r.left + dx, right: r.right + dx, top: r.top, bottom: r.bottom }; })();
    if (shown.some((o) => overlaps(o, t))) { hide(e); continue; }
    shown.push(t);
  }
  const boxes = ticks.map((e) => ({ e, b: text(e), k: Number(e.dataset.k), minor: !!e.closest(".minor") }));
  const whole = boxes.filter(({ e, b }) => {
    if (b.left >= lo && b.right <= hi) return true;
    hide(e);
    return false;
  });
  for (const minor of [false, true]) {
    const series = whole.filter((t) => t.minor === minor);
    const step = skipStep(series.map((t) => ({ left: t.b.left, right: t.b.right, top: t.b.top, bottom: t.b.bottom, k: t.k })));
    for (const t of series) if (!keptBy(t.k, step) || shown.some((o) => overlaps(o, t.b))) hide(t.e);
  }
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
