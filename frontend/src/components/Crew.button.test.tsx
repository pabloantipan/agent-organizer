// @ts-expect-error node:fs has no type declarations in this tsconfig
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ALL_RUNNING, attachIn, Crew, focusAfter, startCrew } from "./Crew";
import type { AgentGroup } from "../hooks/useWails";

// leftovers-31 FR-2 to FR-4 (launch-progress L16 amended, L17, L18). Vitest
// runs in Node with no DOM: the crew block is rendered to markup, and focus
// is read off small fakes, as Crew.hold.test.ts does. The live presses are
// the Tab harness rows B1 and B4.

const live = { state: "running", session: "p-probe-x", pid: 1, tty: "s001", uptime: "1m" };
const seatOf = (name: string, on: boolean) => ({ name, session: `p-probe-${name}`, agent: on ? { ...live, session: `p-probe-${name}` } : undefined });
const groupOf = (on: boolean[]) => ({
  id: "init-a",
  cell: { project: "p", state: "running", agents: ["po_a", "dev_b", "qa_c"] },
  retirable: [],
  agents: [],
  crew: ["po_a", "dev_b", "qa_c"].map((n, i) => seatOf(n, on[i])),
}) as unknown as AgentGroup;
const launchBtn = (html: string) => html.match(/<button[^>]*class="tiny-btn primary"[^>]*>(?:<svg.*?<\/svg>)? ?(.*?)<\/button>/)?.[1] ?? null;

describe("B2: no launch button with every seat running (FR-2, L17)", () => {
  it("draws none with all live, and the meta reads 3 live · 0 off; Retire… stays", () => {
    const html = renderToStaticMarkup(<Crew group={groupOf([true, true, true])} />);
    expect(launchBtn(html)).toBeNull();
    expect(html).toContain("3 seats · 3 live · 0 off");
    expect(html).toContain("Retire…");
  });
  it("draws Bring 1 up with one off and Bring crew up with all off", () => {
    expect(launchBtn(renderToStaticMarkup(<Crew group={groupOf([true, false, true])} />))).toBe("Bring 1 up");
    expect(launchBtn(renderToStaticMarkup(<Crew group={groupOf([false, false, false])} />))).toBe("Bring crew up");
  });
  it("names the retired label nowhere in Crew.tsx (the grep of B2 covers frontend/src)", () => {
    const crew = readFileSync(new URL("./Crew.tsx", import.meta.url), "utf8") as string;
    expect(crew).not.toContain(["Re", "attach"].join(""));
  });
});

type FakeEl = { label: string; focus: () => void };
function fakeDom(seats: { name: string; attach: boolean }[], launch: string | null = null) {
  const doc = { activeElement: null as unknown };
  (globalThis as { document?: unknown }).document = doc;
  (globalThis as { CSS?: unknown }).CSS = { escape: (s: string) => s };
  const el = (label: string): FakeEl => { const e = { label, focus: () => { doc.activeElement = e; } }; return e; };
  const attaches = seats.filter((s) => s.attach).map((s) => ({ seat: s.name, el: el(`Attach ${s.name}`) }));
  const btn = launch ? el(launch) : null;
  const box = {
    querySelector: (q: string) => {
      if (q.endsWith('button[aria-label^="Attach "]')) {
        const m = q.match(/data-seat="([^"]+)"/);
        return (m ? attaches.find((a) => a.seat === m[1]) : attaches[0])?.el ?? null;
      }
      if (q === 'button[data-crew="launch"]:not([disabled])') return btn;
      return null;
    },
  };
  return { doc, box: box as unknown as ParentNode, btn: btn as unknown as HTMLElement | null };
}

afterEach(() => { delete (globalThis as { document?: unknown }).document; });

describe("B3: Start finds every seat running (FR-3, L18)", () => {
  it("closes the confirm, says so, lists nothing, and focus goes to the first seat's Attach", async () => {
    // The confirm opened with dev_b off; the feed then marks it live.
    const before = renderToStaticMarkup(<Crew group={groupOf([true, false, true])} />);
    expect(launchBtn(before)).toBe("Bring 1 up");
    const after = groupOf([true, true, true]);
    const create = vi.fn(async () => [] as string[]); // queues nothing
    const calls: string[] = [];
    let said = "";
    const d = fakeDom([{ name: "po_a", attach: true }, { name: "dev_b", attach: true }, { name: "qa_c", attach: true }]);
    await startCrew("init-a", {
      create,
      queued: () => calls.push("queued"),
      none: () => calls.push("confirm closed"),
      say: (m) => { said = m; },
      failed: () => calls.push("failed"),
    });
    // What the crew block does on `none` once the confirm is gone.
    attachIn(d.box)?.focus();
    expect(create).toHaveBeenCalledWith("init-a");
    expect(calls).toEqual(["confirm closed"]);
    expect(said).toBe(ALL_RUNNING);
    expect(said).toBe("Every seat is already running");
    expect((d.doc.activeElement as FakeEl).label).toBe("Attach po_a");
    const html = renderToStaticMarkup(<Crew group={after} />);
    expect(html).not.toContain("launch-head");
    expect(html).not.toContain("confirm-inline");
    expect(launchBtn(html)).toBeNull();
  });
  it("lets a press that queued seats go on to the list", async () => {
    const calls: string[] = [];
    await startCrew("init-a", { create: async () => ["line"], queued: () => calls.push("queued"), none: () => calls.push("none"), say: () => calls.push("say"), failed: () => calls.push("failed") });
    expect(calls).toEqual(["queued"]);
  });
});

describe("B4: focus after the list closes (FR-4, L16 amended)", () => {
  it("closed by itself: the first listed seat's Attach", () => {
    const d = fakeDom([{ name: "po_a", attach: true }, { name: "dev_b", attach: true }]);
    focusAfter(d.box, ["dev_b"])?.focus();
    expect((d.doc.activeElement as FakeEl).label).toBe("Attach dev_b");
  });
  it("Close the list after a failure: Bring 1 up, which the block still draws", () => {
    const html = renderToStaticMarkup(<Crew group={groupOf([true, false, true])} />);
    expect(launchBtn(html)).toBe("Bring 1 up");
    // The list showed dev_b alone, which failed: no Attach (leftovers-32 FR-4).
    const d = fakeDom([{ name: "po_a", attach: true }, { name: "qa_c", attach: true }], "Bring 1 up");
    focusAfter(d.box, ["dev_b"])?.focus();
    expect((d.doc.activeElement as FakeEl).label).toBe("Bring 1 up");
  });
});
