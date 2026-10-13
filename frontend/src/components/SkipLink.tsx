import { useEffect, useState, type MouseEvent } from "react";

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

/** A modal is open: a drawer or sheet over a backdrop (the role drawer, a
 *  card back, Retire). Read from the document so no modal has to report
 *  itself (leftovers-24 FR-10). */
export const BACKDROP = ".modal-backdrop";
/** What can take focus inside a modal, as the drawers' traps count it. */
const TRAP_ITEMS = "button, summary, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])";

export function openModal(doc: Pick<Document, "querySelector"> = document): HTMLElement | null {
  return doc.querySelector<HTMLElement>(`${BACKDROP} .modal`);
}

/** Focus fallen to body while a modal is open goes into the modal on the
 *  next Tab: its first control, or its last on Shift+Tab, which the
 *  modal's own trap owns from there (tab-reaches-links T7). Returns the
 *  element focused, or null when the key is left to the browser. */
export function tabIntoModal(e: Pick<KeyboardEvent, "key" | "shiftKey" | "defaultPrevented" | "preventDefault">, doc: Document = document): HTMLElement | null {
  if (e.key !== "Tab" || e.defaultPrevented) return null;
  const at = doc.activeElement;
  if (at && at !== doc.body && at !== doc.documentElement) return null;
  const modal = openModal(doc);
  if (!modal) return null;
  const items = Array.from(modal.querySelectorAll<HTMLElement>(TRAP_ITEMS)).filter((el) => !el.hasAttribute("disabled"));
  const to = (e.shiftKey ? items[items.length - 1] : items[0]) ?? modal;
  if (to === modal && !modal.hasAttribute("tabindex")) modal.tabIndex = -1;
  e.preventDefault();
  to.focus();
  return to;
}

/** Whether a modal is open, kept current by watching the document. */
function useModalOpen(): boolean {
  const [open, setOpen] = useState(() => typeof document !== "undefined" && openModal() !== null);
  useEffect(() => {
    const read = () => setOpen(openModal() !== null);
    read();
    const watch = new MutationObserver(read);
    watch.observe(document.body, { childList: true, subtree: true });
    const onKey = (e: KeyboardEvent) => { tabIntoModal(e); };
    document.addEventListener("keydown", onKey);
    return () => { watch.disconnect(); document.removeEventListener("keydown", onKey); };
  }, []);
  return open;
}

/** The first Tab stop on every screen: hidden until focused, then at the
 *  top left over the bar with the focus ring (styles/shell.css). Enter
 *  follows the link, which puts focus in main rather than only scrolling.
 *  While a modal is open it is not rendered, since it would lead under the
 *  backdrop; `inert` is not used, the floor is Safari 15.0 (FR-10). */
export function SkipLink() {
  const modal = useModalOpen();
  if (modal) return null;
  const onClick = (e: MouseEvent<HTMLAnchorElement>) => { e.preventDefault(); skipToContent(); };
  return <a className="skip-link" href={`#${MAIN_ID}`} onClick={onClick}>Skip to content</a>;
}
