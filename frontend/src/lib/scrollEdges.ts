// A region that scrolls inside a view shows it does (design system, Widths,
// leftovers-3 U1; initiative-header FR-17): while content hides past an
// edge, that edge carries a 1 px line, gone once scrolled to that end.
// Overlay scrollbars on macOS hide until scrolled, so they do not count.

export type Edges = { top: boolean; bottom: boolean };

/** Which edges have content hidden past them. One pixel of slack absorbs
 *  the fractional scroll positions WebKit reports at the ends. */
export function scrollEdges(m: { scrollTop: number; scrollHeight: number; clientHeight: number }): Edges {
  const hidden = m.scrollHeight - m.clientHeight;
  if (hidden <= 1) return { top: false, bottom: false };
  return { top: m.scrollTop > 1, bottom: m.scrollTop < hidden - 1 };
}
