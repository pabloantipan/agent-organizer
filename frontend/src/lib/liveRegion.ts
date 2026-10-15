import { useEffect, useMemo, useState } from "react";

/** How long the region stays empty before a message is set again
 *  (launch-progress A1, L25): 2 ms is not known to re-announce in
 *  VoiceOver; 100 ms is the common floor. */
export const SAY_GAP_MS = 100;

/** A screen-reader-only live region says a repeated message again (the
 *  design-system rule "The newest answer wins, and focus never drops";
 *  leftovers-32 FR-2, leftovers-33 FR-4, launch-progress L20, L25): `say`
 *  empties the text now and sets it SAY_GAP_MS later, in a later task. A
 *  task, not a frame: a window that draws no frame (hidden, or the
 *  harness's offscreen one) never runs requestAnimationFrame. A newer
 *  message before the task runs replaces the older one. `then` runs right
 *  after the text is set, so a focus move can follow what is said
 *  (leftovers-33 FR-3); a replaced message's `then` runs with the newer
 *  text, `stop` drops them. Visible live text never goes through this:
 *  emptied, it would blink. */
export function speaker(set: (m: string) => void, later: (f: () => void) => unknown = (f) => setTimeout(f, SAY_GAP_MS), cancel: (t: unknown) => void = (t) => clearTimeout(t as ReturnType<typeof setTimeout>)) {
  let pending: unknown;
  let thens: (() => void)[] = [];
  return {
    say: (m: string, then?: () => void) => {
      if (pending !== undefined) cancel(pending);
      if (then) thens.push(then);
      set("");
      pending = later(() => {
        pending = undefined;
        set(m);
        const run = thens;
        thens = [];
        for (const f of run) f();
      });
    },
    stop: () => { if (pending !== undefined) cancel(pending); pending = undefined; thens = []; },
  };
}

/** Says a message, and runs `then` once it is set. */
export type Say = (m: string, then?: () => void) => void;

/** The text of a screen-reader-only live region and the `say` that sets it.
 *  The task that sets the text is queued only once the empty text is
 *  committed: a timer queued at once can run before React renders, and the
 *  two updates then batch into one, so nothing is said again (N2, seen in
 *  WKWebView). */
export function useLiveRegion(): [string, Say] {
  const [text, setText] = useState("");
  const [due, setDue] = useState<{ f: () => void } | null>(null);
  const s = useMemo(() => speaker(setText, (f) => { const d = { f }; setDue(d); return d; }, () => setDue(null)), []);
  useEffect(() => {
    if (!due) return;
    const t = setTimeout(due.f, SAY_GAP_MS);
    return () => clearTimeout(t);
  }, [due]);
  return [text, s.say];
}
