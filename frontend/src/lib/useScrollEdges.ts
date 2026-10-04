// The scroll edge (design system, Widths; leftovers-5 FR-9): a region that
// scrolls inside a view carries a 1 px --fg-subtle line on each edge with
// content hidden past it, measured here for the initiative header's open
// area.
import { useLayoutEffect, useState, type RefObject } from "react";
import { scrollEdges, type Edges } from "./scrollEdges";

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
