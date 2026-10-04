/** leftovers-5 FR-1 (Focus and names): Escape closes the topmost open box
 *  only. Every box that Escape closes (Help, a card back, a rule box) opens
 *  itself here and the one document listener hands Escape to the box on
 *  top, in the order the boxes opened. A box that is busy (a ruling being
 *  written) keeps the Escape and does nothing with it: the box under it
 *  never sees it. A key already handled inside a box (preventDefault, as the
 *  search's clear and a note's edit do) is left alone. */

export type BoxEscape = () => void;

type Entry = { id: number; escape: BoxEscape };

let stack: Entry[] = [];
let next = 1;
let listening = false;

function onKey(e: KeyboardEvent) {
  if (e.key !== "Escape" || e.defaultPrevented) return;
  const top = stack[stack.length - 1];
  if (!top) return;
  e.preventDefault();
  top.escape();
}

/** Puts a box on top of the stack; the returned function takes it off,
 *  wherever it sits by then. `escape` is read on every Escape, so pass a
 *  function that reads the box's latest state (a ref), not a stale one. */
export function openBox(escape: BoxEscape): () => void {
  const entry = { id: next++, escape };
  stack.push(entry);
  if (!listening && typeof document !== "undefined") {
    document.addEventListener("keydown", onKey);
    listening = true;
  }
  return () => {
    stack = stack.filter((b) => b.id !== entry.id);
    if (stack.length === 0 && listening) {
      document.removeEventListener("keydown", onKey);
      listening = false;
    }
  };
}

/** How many boxes are open (tests). */
export function openBoxes(): number {
  return stack.length;
}

/** The handler itself, for tests that have no document. */
export const escapeTop = onKey;
