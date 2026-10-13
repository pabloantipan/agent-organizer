/** The one Tab trap of an open box (leftovers-25 FR-10): the rule box, the
 *  role drawer and the card back all loop Tab through it.
 *
 *  While the box is open, Tab and Shift+Tab loop inside it, so focus never
 *  lands on a row the box covers, nor on `body`. Every Tab is moved here,
 *  not only the one at an edge, so WebKit, which skips buttons on Tab by
 *  default, walks the same stops as Chromium. A radio group is one stop: its
 *  checked radio, else its first, as the browser does. From an element that
 *  is not a stop (the title), Tab goes to the first stop and Shift+Tab to
 *  the last. */
export type TabKey = { key: string; shiftKey: boolean; altKey: boolean; ctrlKey: boolean; metaKey: boolean; preventDefault(): void; stopPropagation(): void };

export function loopTab(e: TabKey, root: HTMLElement | null) {
  if (e.key !== "Tab" || e.altKey || e.ctrlKey || e.metaKey || !root) return;
  const stops = tabStops(root);
  if (stops.length === 0) return;
  e.preventDefault();
  e.stopPropagation();
  const active = document.activeElement;
  const at = isRadio(active) ? stops.findIndex((s) => isRadio(s) && s.name === active.name) : stops.indexOf(active as HTMLElement);
  const next = at < 0
    ? (e.shiftKey ? stops.length - 1 : 0)
    : (at + (e.shiftKey ? -1 : 1) + stops.length) % stops.length;
  stops[next].focus();
}

const STOPS = "button, textarea, input, select, summary, a[href], [tabindex]";

const isRadio = (el: Element | null): el is HTMLInputElement =>
  !!el && el.tagName === "INPUT" && (el as HTMLInputElement).type === "radio";

/** The box's tab stops in document order: enabled, shown, not taken out of
 *  the order, one per radio group. */
export function tabStops(root: HTMLElement): HTMLElement[] {
  const all = Array.from(root.querySelectorAll<HTMLElement>(STOPS))
    .filter((el) => el.tabIndex >= 0 && !el.matches(":disabled") && el.getClientRects().length > 0);
  const out: HTMLElement[] = [];
  const groups = new Set<string>();
  for (const el of all) {
    if (isRadio(el) && el.name) {
      if (groups.has(el.name)) continue;
      groups.add(el.name);
      const group = all.filter((r): r is HTMLInputElement => isRadio(r) && r.name === el.name);
      out.push(group.find((r) => r.checked) ?? group[0]);
    } else out.push(el);
  }
  return out;
}
