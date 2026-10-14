import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it } from "vitest";
import { Crew, focusAfter } from "./Crew";
import type { AgentGroup } from "../hooks/useWails";

// leftovers-32 FR-1, FR-3, FR-4 (launch-progress L19, L21, L22). Vitest runs
// in Node with no DOM, as Crew.button.test.tsx: the block is rendered to
// markup and focus is read off small fakes. The presses themselves are the
// Tab harness rows N1, N3 and N4.

const live = { state: "running", session: "p-probe-x", pid: 1, tty: "s001", uptime: "1m" };
const seatOf = (name: string, on: boolean) => ({ name, session: `p-probe-${name}`, agent: on ? { ...live, session: `p-probe-${name}` } : undefined });
const groupOf = (on: boolean[]) => ({
  id: "init-a",
  cell: { project: "p", state: "running", agents: ["po_a", "dev_b", "qa_c"] },
  retirable: [],
  agents: [],
  crew: ["po_a", "dev_b", "qa_c"].map((n, i) => seatOf(n, on[i])),
}) as unknown as AgentGroup;
const launchBtn = (html: string) => html.match(/<button[^>]*data-crew="launch"[^>]*>(?:<svg.*?<\/svg>)? ?(.*?)<\/button>/)?.[1] ?? null;

type FakeEl = { label: string; focus: () => void };
/** A crew block as focusAfter reads it: seat rows in order, each with or
 *  without an Attach, the launch button if drawn, and Retire…, always. */
function fakeBox(seats: { name: string; attach: boolean }[], launch: string | null) {
  const doc = { activeElement: null as unknown, body: {} };
  (globalThis as { document?: unknown }).document = doc;
  (globalThis as { CSS?: unknown }).CSS = { escape: (s: string) => s };
  const el = (label: string): FakeEl => { const e = { label, focus: () => { doc.activeElement = e; } }; return e; };
  const attaches = seats.filter((s) => s.attach).map((s) => ({ seat: s.name, el: el(`Attach ${s.name}`) }));
  const btn = launch ? el(launch) : null;
  const retire = el("Retire…");
  const box = {
    querySelector: (q: string) => {
      if (q.endsWith('button[aria-label^="Attach "]')) {
        const m = q.match(/data-seat="([^"]+)"/);
        return (m ? attaches.find((a) => a.seat === m[1]) : attaches[0])?.el ?? null;
      }
      if (q === 'button[data-crew="launch"]:not([disabled])') return btn;
      if (q === 'button[data-crew="retire"]') return retire;
      return null;
    },
  };
  return { doc, box: box as unknown as ParentNode };
}
const focused = (d: { doc: { activeElement: unknown } }) => (d.doc.activeElement as FakeEl | null)?.label;

afterEach(() => { delete (globalThis as { document?: unknown }).document; });

describe("N4: one focus function, never the body (FR-4, L22)", () => {
  const listed = ["po_a", "dev_b", "qa_c"];
  it("the first listed seat with an Attach", () => {
    const d = fakeBox([{ name: "po_a", attach: true }, { name: "dev_b", attach: true }, { name: "qa_c", attach: true }], null);
    focusAfter(d.box, listed)?.focus();
    expect(focused(d)).toBe("Attach po_a");
  });
  it("the first without, the second with: the second's Attach", () => {
    const d = fakeBox([{ name: "po_a", attach: false }, { name: "dev_b", attach: true }, { name: "qa_c", attach: true }], "Bring 1 up");
    focusAfter(d.box, listed)?.focus();
    expect(focused(d)).toBe("Attach dev_b");
  });
  it("none with an Attach and a seat off: Bring n up", () => {
    const d = fakeBox([{ name: "po_a", attach: false }, { name: "dev_b", attach: false }, { name: "qa_c", attach: false }], "Bring 3 up");
    focusAfter(d.box, listed)?.focus();
    expect(focused(d)).toBe("Bring 3 up");
  });
  it("none off and no Attach: Retire…", () => {
    const d = fakeBox([{ name: "po_a", attach: false }], null);
    focusAfter(d.box, listed)?.focus();
    expect(focused(d)).toBe("Retire…");
  });
  it("no list (the race, the dead confirm): the first seat row with an Attach", () => {
    const d = fakeBox([{ name: "po_a", attach: false }, { name: "dev_b", attach: true }], null);
    focusAfter(d.box)?.focus();
    expect(focused(d)).toBe("Attach dev_b");
  });
  it("never the body: every case lands on a control", () => {
    const cases: [{ name: string; attach: boolean }[], string | null][] = [[[], null], [[{ name: "po_a", attach: false }], "Bring 1 up"]];
    for (const [seats, launch] of cases) {
      const d = fakeBox(seats, launch);
      focusAfter(d.box, listed)?.focus();
      expect(d.doc.activeElement).not.toBeNull();
      expect(d.doc.activeElement).not.toBe(d.doc.body);
    }
  });
  it("the block draws its targets: data-crew on Bring n up and Retire…", () => {
    const html = renderToStaticMarkup(<Crew group={groupOf([true, false, true])} />);
    expect(launchBtn(html)).toBe("Bring 1 up");
    expect(html).toMatch(/<button data-crew="retire"[^>]*>.*Retire…<\/button>/);
  });
});

describe("N1, N3: what the block draws once no seat is off (FR-1, FR-3)", () => {
  it("with every seat live: 0 off, no launch button, no confirm", () => {
    const html = renderToStaticMarkup(<Crew group={groupOf([true, true, true])} />);
    expect(html).toContain("3 seats · 3 live · 0 off");
    expect(launchBtn(html)).toBeNull();
    expect(html).not.toContain("confirm-inline");
  });
});
