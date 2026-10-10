import { useEffect, useId, useRef } from "react";
import "../styles/deltagos-mark.css";

/* The Deltagos mark (0102; docs/ux/specs/floating-icon.md Amendment 4;
   docs/specs/deltagos-mark.md FR-4): docs/ux/inputs/deltagos-mark/
   deltagos-mark-drawn.html ported, its form and motion unchanged. A D drawn
   as one stroke, three gaps travelling round it with points and notches,
   faster on the bowl than on the stem, and two meshing gears seen through
   the D. Under Reduce motion, the still frame (travel 0). The geometry is
   walked here, not with getPointAtLength, so it is the same everywhere and
   testable without a DOM. */

// Tuning, unchanged from the sketch (deltagos-mark-handoff.md). The gears
// mesh only with these numbers.
const SPEED = 24, GAPS = 3, SPACING = 13, VARY = 0.65, CLOSE = [0.5, 0.85], GAP = 5.25, TIP = 3.2, NOTCH = 3.2, HALF = 4.5;
type Gear = { cx: number; cy: number; teeth: number; rOut: number; rIn: number; hole: number; phase: number };
const GEAR: Gear = { cx: 66.8, cy: 64.8, teeth: 10, rOut: 25.5, rIn: 20.83, hole: 7.65, phase: 27 };
const D45 = 36.4 / Math.SQRT2;
const GEAR2: Gear = { cx: GEAR.cx - D45, cy: GEAR.cy - D45, teeth: 5, rOut: 13.9, rIn: 9.25, hole: 3.5, phase: 27 };
const D = "M27 30 Q27 24 33 24 L48 24 C68 24 77 37 77 50 C77 63 68 76 48 76 L33 76 Q27 76 27 70 Z";

type Pt = { x: number; y: number };
const mod = (a: number, n: number) => ((a % n) + n) % n;

function gearPath(g: Gear): string {
  const n = g.teeth, step = (Math.PI * 2) / n, ht = step * 0.33, tt = step * 0.2, ph = (g.phase * Math.PI) / 180;
  const p = (r: number, a: number) => `${(g.cx + r * Math.cos(a)).toFixed(2)} ${(g.cy + r * Math.sin(a)).toFixed(2)}`;
  let d = "";
  for (let k = 0; k < n; k++) {
    const a = k * step - Math.PI / 2 + ph;
    d += `${k === 0 ? "M" : "L"}${p(g.rIn, a - ht)}L${p(g.rOut, a - tt)}L${p(g.rOut, a + tt)}L${p(g.rIn, a + ht)}`;
  }
  return `${d}ZM${g.cx + g.hole} ${g.cy}A${g.hole} ${g.hole} 0 1 0 ${g.cx - g.hole} ${g.cy}A${g.hole} ${g.hole} 0 1 0 ${g.cx + g.hole} ${g.cy}Z`;
}
const BIG = gearPath(GEAR), SMALL = gearPath(GEAR2);

// The D as a table of points by length, the path above segment by segment.
const track = (() => {
  const q = (a: Pt, b: Pt, c: Pt) => (t: number): Pt => ({ x: (1 - t) ** 2 * a.x + 2 * (1 - t) * t * b.x + t * t * c.x, y: (1 - t) ** 2 * a.y + 2 * (1 - t) * t * b.y + t * t * c.y });
  const c = (a: Pt, b: Pt, e: Pt, f: Pt) => (t: number): Pt => ({
    x: (1 - t) ** 3 * a.x + 3 * (1 - t) ** 2 * t * b.x + 3 * (1 - t) * t * t * e.x + t ** 3 * f.x,
    y: (1 - t) ** 3 * a.y + 3 * (1 - t) ** 2 * t * b.y + 3 * (1 - t) * t * t * e.y + t ** 3 * f.y,
  });
  const l = (a: Pt, b: Pt) => (t: number): Pt => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
  const P = (x: number, y: number): Pt => ({ x, y });
  const segs = [
    q(P(27, 30), P(27, 24), P(33, 24)), l(P(33, 24), P(48, 24)),
    c(P(48, 24), P(68, 24), P(77, 37), P(77, 50)), c(P(77, 50), P(77, 63), P(68, 76), P(48, 76)),
    l(P(48, 76), P(33, 76)), q(P(33, 76), P(27, 76), P(27, 70)), l(P(27, 70), P(27, 30)),
  ];
  const pts: Pt[] = [P(27, 30)], at: number[] = [0];
  for (const f of segs) {
    for (let i = 1; i <= 400; i++) {
      const p = f(i / 400), last = pts[pts.length - 1];
      at.push(at[at.length - 1] + Math.hypot(p.x - last.x, p.y - last.y));
      pts.push(p);
    }
  }
  return { pts, at, length: at[at.length - 1] };
})();
export const markLength = track.length;
const L = markLength;

function pointAt(d: number): Pt {
  const s = mod(d, L), { at, pts } = track;
  let lo = 0, hi = at.length - 1;
  while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (at[mid] <= s) lo = mid; else hi = mid; }
  const span = at[hi] - at[lo] || 1, u = (s - at[lo]) / span;
  return { x: pts[lo].x + (pts[hi].x - pts[lo].x) * u, y: pts[lo].y + (pts[hi].y - pts[lo].y) * u };
}

// Fastest at the bowl's outermost point, slowest on the stem (cosine).
const FAST_AT = (() => { let best = -Infinity, at = 0; for (let d = 0; d < L; d += 0.5) { const x = pointAt(d).x; if (x > best) { best = x; at = d; } } return at; })();
const phase = (d: number) => Math.cos((2 * Math.PI * (mod(d, L) - FAST_AT)) / L);
const speedAt = (d: number) => SPEED * (1 + VARY * phase(d));
const smooth = (a: number, b: number, x: number) => { const u = Math.min(1, Math.max(0, (x - a) / (b - a))); return u * u * (3 - 2 * u); };
const openness = (d: number) => 1 - smooth(CLOSE[0], CLOSE[1], phase(d));
function frame(d: number) {
  const a = pointAt(d), b = pointAt(d + 0.5);
  let tx = b.x - a.x, ty = b.y - a.y; const m = Math.hypot(tx, ty) || 1; tx /= m; ty /= m;
  return { x: a.x, y: a.y, nx: -ty, ny: tx };
}
const pts = (l: number[][]) => l.map((q) => `${q[0].toFixed(2)},${q[1].toFixed(2)}`).join(" ");

export type MarkFrame = { dasharray: string; dashoffset: string; tips: string[]; notches: string[]; big: string; small: string };

/** The mark at a point of its travel, as the drawing's render(travel). */
export function markFrame(travel: number): MarkFrame {
  const starts: number[] = [], gaps: number[] = [];
  for (let i = 0; i < GAPS; i++) { starts.push(travel + i * SPACING); const o = openness(starts[i] - GAP); gaps.push(o < 0.06 ? 0 : GAP * o); }
  const dash: string[] = [];
  for (let j = 0; j < GAPS; j++) { const len = j < GAPS - 1 ? SPACING : L - (GAPS - 1) * SPACING, g = gaps[(j + 1) % GAPS]; dash.push((len - g).toFixed(2), g.toFixed(2)); }
  const tips: string[] = [], notches: string[] = [], W = HALF + 0.8;
  for (let n = 0; n < GAPS; n++) {
    const k = gaps[n] / GAP, start = starts[n], gap = gaps[n];
    if (k < 0.06) { tips.push(""); notches.push(""); continue; }
    const h = frame(start - gap - 0.15), hp = pointAt(start - gap + TIP * k);
    tips.push(pts([[h.x + h.nx * HALF, h.y + h.ny * HALF], [hp.x, hp.y], [h.x - h.nx * HALF, h.y - h.ny * HALF]]));
    const t0 = frame(start - 0.3 * k), tp = pointAt(start + NOTCH * k);
    notches.push(pts([[t0.x + t0.nx * W, t0.y + t0.ny * W], [tp.x, tp.y], [t0.x - t0.nx * W, t0.y - t0.ny * W]]));
  }
  const spin = ((travel / GEAR.rOut) * 180) / Math.PI;
  return {
    dasharray: dash.join(" "),
    dashoffset: (-mod(travel, L)).toFixed(2),
    tips,
    notches,
    big: `rotate(${spin.toFixed(2)} ${GEAR.cx} ${GEAR.cy})`,
    small: `rotate(${((-spin * GEAR.teeth) / GEAR2.teeth).toFixed(2)} ${GEAR2.cx.toFixed(2)} ${GEAR2.cy.toFixed(2)})`,
  };
}

/** One step of the loop: the belt moves at the speed where the gap behind it
 *  is, dt capped at 50 ms. */
export const stepTravel = (travel: number, dt: number) => travel + speedAt(travel - GAP) * Math.min(0.05, dt);

const REDUCE = "(prefers-reduced-motion: reduce)";
export const prefersReducedMotion = () => typeof window !== "undefined" && !!window.matchMedia?.(REDUCE).matches;

/** How long the mark moves after it shows and after each hover: 4.5 s,
 *  never over 5 s unasked (floating-icon Amendment 7, F25; WCAG 2.2.2). */
export const PLAY_MS = 4500;

export type MarkRun = { stop: () => void; play: () => void };

/** Runs the mark's loop through `paint` for `ms` of frames, then rests where
 *  it is (no repaint, no jump back to the still frame); `play` moves it `ms`
 *  more from where it rests. Under Reduce motion it paints the still frame
 *  and schedules nothing, and `play` does nothing. */
export function runMark(paint: (f: MarkFrame) => void, ms = PLAY_MS, raf: (cb: (now: number) => void) => number = requestAnimationFrame, caf: (id: number) => void = cancelAnimationFrame): MarkRun {
  paint(markFrame(0));
  let travel = 0, last = -1, until = -1, id = 0, running = false;
  const tick = (now: number) => {
    if (until < 0) until = now + ms;
    if (last >= 0) { travel = stepTravel(travel, (Math.min(now, until) - last) / 1000); paint(markFrame(travel)); }
    last = now;
    if (now >= until) { running = false; return; }
    id = raf(tick);
  };
  const play = () => {
    if (prefersReducedMotion()) return;
    until = -1; // counted from the next frame
    if (running) return;
    running = true; last = -1;
    id = raf(tick);
  };
  play();
  return { stop: () => { if (running) caf(id); running = false; }, play };
}

/** The mark, `size` px wide. Painted by attribute from a requestAnimationFrame
 *  loop, so a frame re-renders nothing. It moves PLAY_MS after it shows and
 *  PLAY_MS more when the pointer moves onto it. The drawing is never named:
 *  beside the wordmark the wordmark is the name, and where the mark stands
 *  alone its button carries `Deltagos` (Amendment 7, F26). */
export function DeltagosMark({ size = 56, animated = true }: { size?: number; animated?: boolean }) {
  const id = "dm" + useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const dform = useRef<SVGPathElement>(null), big = useRef<SVGGElement>(null), small = useRef<SVGGElement>(null);
  const tips = useRef<(SVGPolygonElement | null)[]>([]), notches = useRef<(SVGPolygonElement | null)[]>([]);
  const run = useRef<MarkRun | null>(null);

  useEffect(() => {
    if (!animated) return;
    const paint = (f: MarkFrame) => {
      dform.current?.setAttribute("stroke-dasharray", f.dasharray);
      dform.current?.setAttribute("stroke-dashoffset", f.dashoffset);
      for (let n = 0; n < GAPS; n++) { tips.current[n]?.setAttribute("points", f.tips[n]); notches.current[n]?.setAttribute("points", f.notches[n]); }
      big.current?.setAttribute("transform", f.big);
      small.current?.setAttribute("transform", f.small);
    };
    run.current = runMark(paint);
    // Reduce motion turned on: the still frame. Turned off: it waits for a hover.
    const mq = window.matchMedia?.(REDUCE);
    const changed = () => { if (mq?.matches) { run.current?.stop(); paint(markFrame(0)); } };
    mq?.addEventListener?.("change", changed);
    return () => { run.current?.stop(); run.current = null; mq?.removeEventListener?.("change", changed); };
  }, [animated]);

  const f = markFrame(0); // the still frame, what the first paint shows
  return (
    <svg className="dmark" viewBox="20 17 64 66" width={size} height={(size * 66) / 64} aria-hidden="true" focusable="false" onPointerEnter={() => run.current?.play()}>
      <defs>
        <mask id={`${id}n`} maskUnits="userSpaceOnUse" x="-10" y="-10" width="120" height="120">
          <rect x="-10" y="-10" width="120" height="120" fill="#fff" />
          <g fill="#000">{f.notches.map((p, n) => <polygon key={n} ref={(el) => { notches.current[n] = el; }} points={p} />)}</g>
        </mask>
        <mask id={`${id}s`} maskUnits="userSpaceOnUse" x="-10" y="-10" width="120" height="120">
          <path d={D} fill="#fff" stroke="#fff" strokeWidth="9" strokeLinejoin="round" />
        </mask>
      </defs>
      <g mask={`url(#${id}s)`}>
        <g ref={big} transform={f.big}><path className="dmark-big" fillRule="evenodd" d={BIG} /></g>
        <g ref={small} transform={f.small}><path className="dmark-small" fillRule="evenodd" d={SMALL} /></g>
      </g>
      <path ref={dform} className="dmark-d" mask={`url(#${id}n)`} d={D} fill="none" strokeWidth="9" strokeLinejoin="round" strokeLinecap="butt" strokeDasharray={f.dasharray} strokeDashoffset={f.dashoffset} />
      <g className="dmark-tips">{f.tips.map((p, n) => <polygon key={n} ref={(el) => { tips.current[n] = el; }} points={p} />)}</g>
    </svg>
  );
}

/** The mark with its wordmark and subtitle: where the app names itself (the
 *  Help's header). No splash screen (Amendment 4). */
export function DeltagosLockup() {
  return (
    <div className="dmark-lockup">
      <DeltagosMark size={52} />
      <div className="dmark-words">
        <p className="dmark-wordmark">Deltagos</p>
        <p className="dmark-subtitle">From deltos, the writing tablet, and strategos, the general.</p>
      </div>
    </div>
  );
}
