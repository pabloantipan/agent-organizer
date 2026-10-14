import { afterEach, describe, expect, it } from "vitest";
import { holdInView, keepHeldInView, releaseHeld } from "./Crew";

// leftovers-30 FR-3 (launch-progress L13): the landed row is centred, kept
// in view by each feed update while it has focus and the lead has not
// scrolled; a scroll or a blur lets it go. Vitest runs in Node, so the
// document and the row are small fakes; V1 is the same in WKWebView.

type Listener = (e: { target: unknown }) => void;
function fakePage() {
  const docListeners = new Set<Listener>();
  const scroller = { scrollTop: 0, parentElement: null as unknown };
  const calls: string[] = [];
  const rowListeners = new Map<string, () => void>();
  const row = {
    isConnected: true,
    parentElement: scroller,
    classes: new Set<string>(),
    classList: { add: (c: string) => row.classes.add(c), remove: (c: string) => row.classes.delete(c) },
    scrollIntoView: ({ block }: { block: string }) => { calls.push(block); scroller.scrollTop = block === "center" ? 500 : scroller.scrollTop + 40; },
    addEventListener: (t: string, f: () => void) => rowListeners.set(t, f),
    removeEventListener: (t: string) => rowListeners.delete(t),
  };
  const doc = {
    activeElement: row as unknown,
    scrollingElement: { scrollTop: 0 },
    addEventListener: (_: string, f: Listener) => docListeners.add(f),
    removeEventListener: (_: string, f: Listener) => docListeners.delete(f),
  };
  (globalThis as { document?: unknown }).document = doc;
  const scroll = () => docListeners.forEach((f) => f({ target: scroller }));
  return { row: row as unknown as HTMLElement, scroller, doc, calls, scroll, blur: () => rowListeners.get("blur")?.() };
}

afterEach(() => { releaseHeld(); delete (globalThis as { document?: unknown }).document; });

describe("FR-3: the landed row stays in view", () => {
  it("centres on landing and comes back with nearest on each feed update", () => {
    const p = fakePage();
    holdInView(p.row);
    p.scroll(); // the view's own scroll: the offset it left
    keepHeldInView();
    p.scroll();
    keepHeldInView();
    expect(p.calls).toEqual(["center", "nearest", "nearest"]);
  });

  it("is not pulled back after the lead scrolls", () => {
    const p = fakePage();
    holdInView(p.row);
    p.scroller.scrollTop = 120;
    p.scroll();
    keepHeldInView();
    expect(p.calls).toEqual(["center"]);
  });

  it("carries the scroll margin class while held (leftovers-31 FR-1), and drops it on release", () => {
    const p = fakePage();
    const cls = (p.row as unknown as { classes: Set<string> }).classes;
    holdInView(p.row);
    expect(cls.has("landed-held")).toBe(true);
    p.blur();
    expect(cls.has("landed-held")).toBe(false);
  });

  it("lets go on blur, and when focus is elsewhere at the update", () => {
    const p = fakePage();
    holdInView(p.row);
    p.blur();
    keepHeldInView();
    expect(p.calls).toEqual(["center"]);
    const q = fakePage();
    holdInView(q.row);
    q.doc.activeElement = null;
    keepHeldInView();
    keepHeldInView();
    expect(q.calls).toEqual(["center"]);
  });
});
