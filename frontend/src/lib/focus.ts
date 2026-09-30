import { useEffect, useRef, type KeyboardEvent, type RefObject } from "react";

/** Focus and names for an inline confirm (docs/design-system.md; ui-leftovers
 *  FR-5): when it opens, focus goes to its commit; when it closes (Cancel,
 *  Escape, or the commit done), back to the control that opened it, else to
 *  `fallback` when that control cannot take focus (disabled, or gone). Only
 *  the confirms FR-5 names use it; it is not a focus manager. */
export function useConfirmFocus(open: boolean, fallback?: RefObject<HTMLElement | null>) {
  const opener = useRef<HTMLButtonElement>(null);
  const commit = useRef<HTMLButtonElement>(null);
  const was = useRef(open);
  useEffect(() => {
    if (open && !was.current) commit.current?.focus();
    if (!open && was.current) {
      const o = opener.current;
      o?.focus();
      if (document.activeElement !== o) fallback?.current?.focus();
    }
    was.current = open;
  }, [open, fallback]);
  return { opener, commit };
}

/** Escape closes every confirm: a keydown handler for the element that
 *  holds one. */
export const escapeCloses = (close: () => void) => (e: KeyboardEvent) => {
  if (e.key === "Escape") { e.stopPropagation(); close(); }
};
