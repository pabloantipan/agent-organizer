import type { MouseEvent } from "react";

/** The main region every screen renders (App.tsx), and the skip link's href. */
export const MAIN_ID = "main";

/** What can take focus inside main, in document order. */
const CANDIDATES = "h1, h2, h3, button, a[href], input, select, textarea, [tabindex]";

/** Where Skip to content lands (leftovers-22 FR-2, tab-reaches-links T2):
 *  the main region's first heading or control, past the rail, which is a
 *  stop of its own. Disabled, hidden and tabindex -1 controls are passed
 *  over (a heading with tabindex -1 is a landing, so it counts); none
 *  found, main itself. */
export function skipTarget(main: HTMLElement): HTMLElement {
  for (const el of Array.from(main.querySelectorAll<HTMLElement>(CANDIDATES))) {
    if (el.closest(".rail")) continue;
    if ((el as HTMLButtonElement).disabled) continue;
    const heading = /^H[1-3]$/.test(el.tagName);
    if (!heading && el.getAttribute("tabindex") === "-1") continue;
    if (el.getClientRects().length === 0) continue;
    return el;
  }
  return main;
}

/** Moves focus to skipTarget; a heading without a tabindex gets -1 so it
 *  can hold focus without becoming a Tab stop. */
export function skipToContent(doc: Document = document): HTMLElement | null {
  const main = doc.getElementById(MAIN_ID);
  if (!main) return null;
  const to = skipTarget(main);
  if (!to.hasAttribute("tabindex") && /^H[1-3]$/.test(to.tagName)) to.tabIndex = -1;
  to.focus({ preventScroll: false });
  return to;
}

/** The first Tab stop on every screen: hidden until focused, then at the
 *  top left over the bar with the focus ring (styles/shell.css). Enter
 *  follows the link, which puts focus in main rather than only scrolling. */
export function SkipLink() {
  const onClick = (e: MouseEvent<HTMLAnchorElement>) => { e.preventDefault(); skipToContent(); };
  return <a className="skip-link" href={`#${MAIN_ID}`} onClick={onClick}>Skip to content</a>;
}
