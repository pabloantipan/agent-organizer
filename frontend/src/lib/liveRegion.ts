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

/** The text of a screen-reader-only live region and the `say` that sets it.
 *  The task that sets the text is queued only once the empty text is
 *  committed: a 0 ms timer queued at once can run before React renders,
 *  and the two updates then batch into one, so nothing is said again (N2,
 *  seen in WKWebView). */
export function useLiveRegion(): [string, (m: string) => void] {
  const [text, setText] = useState("");
  const [due, setDue] = useState<{ f: () => void } | null>(null);
  const s = useMemo(() => speaker(setText, (f) => { const d = { f }; setDue(d); return d; }, () => setDue(null)), []);
  useEffect(() => {
    if (!due) return;
    const t = setTimeout(due.f, 0);
    return () => clearTimeout(t);
  }, [due]);
  return [text, s.say];
}
