// The scroll edge (design system, Widths; leftovers-5 FR-9, FR-13): a region
// that scrolls inside a view carries a 1 px --fg-subtle line on each edge
// with content hidden past it. One watcher measures it for the initiative
// header's open area (top and bottom) and for a code block or table that
// scrolls sideways in a markdown body (left and right).
import { useLayoutEffect, useState, type RefObject } from "react";
import { scrollEdges, type Edges } from "./scrollEdges";

export type SideEdges = { left: boolean; right: boolean };

/** Which side edges have content hidden past them; one pixel of slack, as
 *  scrollEdges has for the ends WebKit reports fractionally. */
export function sideEdges(m: { scrollLeft: number; scrollWidth: number; clientWidth: number }): SideEdges {
  const hidden = m.scrollWidth - m.clientWidth;
  if (hidden <= 1) return { left: false, right: false };
  return { left: m.scrollLeft > 1, right: m.scrollLeft < hidden - 1 };
}

/** Calls `measure` on scroll and whenever the area or anything in it
 *  changes size, children added after the start included (S6: a clamp's
 *  "more", a body set by innerHTML). Returns the cleanup. */
export function watchEdges(el: HTMLElement, measure: () => void): () => void {
  measure();
  el.addEventListener("scroll", measure, { passive: true });
  const ro = new ResizeObserver(measure);
  ro.observe(el);
  for (const c of Array.from(el.children)) ro.observe(c);
  const mo = new MutationObserver((records) => {
    for (const r of records) r.addedNodes.forEach((n) => { if (n instanceof Element) ro.observe(n); });
    measure();
  });
  mo.observe(el, { childList: true });
  return () => { el.removeEventListener("scroll", measure); ro.disconnect(); mo.disconnect(); };
}

/** Which edges of a scroll area have content hidden past them (FR-17, the
 *  design system's Widths), while `on`. */
export function useScrollEdges(ref: RefObject<HTMLElement | null>, on: boolean): Edges {
  const [edges, setEdges] = useState<Edges>({ top: false, bottom: false });
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !on) { setEdges({ top: false, bottom: false }); return; }
    return watchEdges(el, () => {
      const e = scrollEdges(el);
      setEdges((p) => (p.top === e.top && p.bottom === e.bottom ? p : e));
    });
  }, [ref, on]);
  return edges;
}

/** FR-13: every `pre` and table in a markdown body that scrolls sideways
 *  carries the edge on the side with hidden content only, as the classes
 *  `edge-left` and `edge-right` (global.css). Blocks the body gains later
 *  (innerHTML, a "show all") are watched as they arrive. */
export function useMarkdownEdges(ref: RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;
    const watched = new Map<HTMLElement, () => void>();
    const sync = () => {
      const blocks = new Set(Array.from(root.querySelectorAll<HTMLElement>("pre, table")));
      for (const [b, stop] of watched) if (!blocks.has(b)) { stop(); watched.delete(b); }
      for (const b of blocks) {
        if (watched.has(b)) continue;
        watched.set(b, watchEdges(b, () => {
          const e = sideEdges(b);
          b.classList.toggle("edge-left", e.left);
          b.classList.toggle("edge-right", e.right);
        }));
      }
    };
    sync();
    const mo = new MutationObserver(sync);
    mo.observe(root, { childList: true, subtree: true });
    return () => { mo.disconnect(); for (const stop of watched.values()) stop(); };
  }, [ref]);
}
