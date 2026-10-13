// The scroll edge (design system, Widths; leftovers-5 FR-9, FR-13): a region
// that scrolls inside a view carries a 1 px --fg-subtle line on each edge
// with content hidden past it. One watcher measures it for the initiative
// header's open area (top and bottom) and for a code block or table that
// scrolls sideways in a markdown body (left and right). The same measurement
// makes the region a Tab stop while it overflows (scrollStop, leftovers-26
// FR-1), so there is no second observer.
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

/** What a scroll region is called (tab-reaches-links A3 §1): its own words,
 *  or the id of the visible heading over it. */
export type RegionName = { label: string } | { labelledBy: string };

/** The names of A3 §1, one place for every region the edge hooks watch. */
export const regionName = {
  cardBody: (title: string): RegionName => ({ label: `${title}, details` }),
  roleBody: (role: string): RegionName => ({ label: `${role}, details` }),
  record: (number: string, title: string): RegionName => ({ label: `Record ${number}, ${title}` }),
  floatList: { label: "Initiatives list" } as RegionName,
  headerOpen: (id: string): RegionName => ({ label: `Details of ${id}` }),
  block: (tag: string): RegionName => ({ label: tag.toUpperCase() === "TABLE" ? "Table, scrolls" : "Code, scrolls" }),
};

type StopTarget = Pick<Element, "getAttribute" | "setAttribute" | "removeAttribute">;

/** FR-1 (T22, design system: a region that scrolls is a stop while it
 *  scrolls): while `overflows`, the region takes `tabindex="0"`, a role and
 *  its name, so the keyboard reaches it and WebKit scrolls it natively;
 *  otherwise all three go. The role is `region`, unless the element has a
 *  role of its own (the floating list's listbox), which it keeps. The focus
 *  ring is the stylesheet's `:focus-visible`. Idempotent: it writes only
 *  what differs, so a measurement on every scroll costs nothing. */
export function scrollStop(el: StopTarget, overflows: boolean, name: RegionName) {
  const set = (k: string, v: string | null) => {
    if (el.getAttribute(k) === v) return;
    if (v === null) el.removeAttribute(k); else el.setAttribute(k, v);
  };
  const n = overflows ? name : null;
  const ownRole = el.getAttribute("role") !== null && el.getAttribute("role") !== "region";
  set("tabindex", n ? "0" : null);
  if (!ownRole) set("role", n ? "region" : null);
  set("aria-label", n && "label" in n ? n.label : null);
  set("aria-labelledby", n && "labelledBy" in n ? n.labelledBy : null);
}

/** Overflow past either end, with the same pixel of slack as the edges. */
export const overflowsY = (m: { scrollHeight: number; clientHeight: number }) => m.scrollHeight - m.clientHeight > 1;
export const overflowsX = (m: { scrollWidth: number; clientWidth: number }) => m.scrollWidth - m.clientWidth > 1;

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
 *  design system's Widths), while `on`. With a `name`, the area is also a
 *  Tab stop while it overflows (scrollStop). */
export function useScrollEdges(ref: RefObject<HTMLElement | null>, on: boolean, name?: RegionName): Edges {
  const [edges, setEdges] = useState<Edges>({ top: false, bottom: false });
  const label = name ? JSON.stringify(name) : "";
  useLayoutEffect(() => {
    const el = ref.current;
    const named: RegionName | null = label ? JSON.parse(label) : null;
    if (!el) return;
    if (!on) { setEdges({ top: false, bottom: false }); if (named) scrollStop(el, false, named); return; }
    return watchEdges(el, () => {
      const e = scrollEdges(el);
      setEdges((p) => (p.top === e.top && p.bottom === e.bottom ? p : e));
      if (named) scrollStop(el, overflowsY(el), named);
    });
  }, [ref, on, label]);
  return edges;
}

/** FR-13: every `pre` and table in a markdown body that scrolls sideways
 *  carries the edge on the side with hidden content only, as the classes
 *  `edge-left` and `edge-right` (global.css), and is a stop named `Code,
 *  scrolls` or `Table, scrolls` while it does (leftovers-26 FR-2). Blocks the body gains later
 *  (innerHTML, a "show all") are watched as they arrive. `content` is what
 *  the body shows (its html): a body that mounts later, or is replaced, is
 *  picked up when it changes. */
export function useMarkdownEdges(ref: RefObject<HTMLElement | null>, content?: unknown) {
  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;
    return watchMarkdown(root);
  }, [ref, content]);
}

/** The watch useMarkdownEdges runs over one body: each `pre` and table in
 *  it, now and later, measured for its side edges and its stop. Returns the
 *  cleanup. */
export function watchMarkdown(root: HTMLElement): () => void {
  const watched = new Map<HTMLElement, () => void>();
  // A refresh may set the body's HTML again, same text, new nodes: a block
  // that held focus is replaced and focus falls to the document, out of the
  // box's trap. The block that took its place takes focus back.
  let held: { block: HTMLElement; at: number } | null = null;
  const blocksOf = () => Array.from(root.querySelectorAll<HTMLElement>("pre, table"));
  const onFocus = (e: Event) => {
    const at = e.target instanceof HTMLElement ? blocksOf().indexOf(e.target) : -1;
    held = at >= 0 ? { block: e.target as HTMLElement, at } : null;
  };
  // Focus that moves to an element is no longer held; focus that falls to
  // nothing (a removed node) is.
  const onBlur = (e: FocusEvent) => { if (e.relatedTarget) held = null; };
  root.addEventListener("focusin", onFocus);
  root.addEventListener("focusout", onBlur);
  const sync = () => {
    const list = blocksOf();
    const blocks = new Set(list);
    const lost = held && !blocks.has(held.block) ? held.at : -1;
    for (const [b, stop] of watched) if (!blocks.has(b)) { stop(); watched.delete(b); }
    for (const b of blocks) {
      if (watched.has(b)) continue;
      watched.set(b, watchEdges(b, () => {
        const e = sideEdges(b);
        b.classList.toggle("edge-left", e.left);
        b.classList.toggle("edge-right", e.right);
        scrollStop(b, overflowsX(b), regionName.block(b.tagName));
      }));
    }
    if (lost >= 0) {
      held = null;
      const active = document.activeElement;
      const back = list[lost];
      if (back && (!active || active === document.body) && back.getAttribute("tabindex") === "0") back.focus({ preventScroll: true });
    }
  };
  sync();
  const mo = new MutationObserver(sync);
  mo.observe(root, { childList: true, subtree: true });
  return () => { mo.disconnect(); root.removeEventListener("focusin", onFocus); root.removeEventListener("focusout", onBlur); for (const stop of watched.values()) stop(); };
}
