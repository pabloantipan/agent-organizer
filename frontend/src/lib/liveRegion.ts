import { useEffect, useMemo, useState } from "react";

/** A screen-reader-only live region says a repeated message again (the
 *  design-system rule "The newest answer wins, and focus never drops";
 *  leftovers-32 FR-2, launch-progress L20): `say` empties the text now and
 *  sets it in a following task. A task, not a frame: a window that draws no
 *  frame (hidden, or the harness's offscreen one) never runs
 *  requestAnimationFrame. A newer message before the task runs replaces the
 *  older one. Visible live text never goes through this: emptied, it would
 *  blink. */
export function speaker(set: (m: string) => void, later: (f: () => void) => unknown = (f) => setTimeout(f, 0), cancel: (t: unknown) => void = (t) => clearTimeout(t as ReturnType<typeof setTimeout>)) {
  let pending: unknown;
  return {
    say: (m: string) => {
      if (pending !== undefined) cancel(pending);
      set("");
      pending = later(() => { pending = undefined; set(m); });
    },
    stop: () => { if (pending !== undefined) cancel(pending); pending = undefined; },
  };
}

/** The text of a screen-reader-only live region and the `say` that sets it. */
export function useLiveRegion(): [string, (m: string) => void] {
  const [text, setText] = useState("");
  const s = useMemo(() => speaker(setText), []);
  useEffect(() => s.stop, [s]);
  return [text, s.say];
}
