import { describe, expect, it, vi } from "vitest";
// @ts-expect-error node:fs has no type declarations in this tsconfig
import { readFileSync } from "node:fs";

// review-map v3 FR-41 (A10): the Review screen's Open the thread lands focus
// on that thread's divider in Conversations, `← Review` the next Tab stop,
// never the body. Vitest runs in Node with no DOM library, so the divider
// and `← Review` are stand-ins that record focus and listeners; the
// harness row presses the keys in WKWebView.

vi.mock("../hooks/useWails", () => ({ api: {} }));
vi.mock("../stores/board.store", () => {
  const state = {};
  return { useBoard: Object.assign((sel?: (s: unknown) => unknown) => (sel ? sel(state) : state), { getState: () => state, setState: () => undefined }) };
});

const { landDivider, reviewBackOf, sentWatch } = await import("./Conversation");

type Key = { key: string; shiftKey?: boolean; altKey?: boolean; ctrlKey?: boolean; metaKey?: boolean; preventDefault: () => void };
const stand = (name: string, log: string[]) => {
  const on: Record<string, ((e: Key) => void)[]> = {};
  return {
    focus: () => { log.push(name); },
    addEventListener: (t: string, f: (e: Key) => void) => { (on[t] ??= []).push(f); },
    removeEventListener: (t: string, f: (e: Key) => void) => { on[t] = (on[t] ?? []).filter((g) => g !== f); },
    fire: (t: string, e: Partial<Key> = {}) => { const ev = { key: "", preventDefault: vi.fn(), ...e } as Key; for (const f of [...(on[t] ?? [])]) f(ev); return ev; },
    listeners: () => Object.values(on).flat().length,
  };
};

describe("A10 (FR-41): Open the thread lands on the thread's divider", () => {
  it("focus on the divider; one Tab reaches ← Review", () => {
    const log: string[] = [];
    const divider = stand("divider", log), back = stand("back", log);
    landDivider(divider as unknown as HTMLElement, back as unknown as HTMLElement);
    expect(log).toEqual(["divider"]);
    const e = divider.fire("keydown", { key: "Tab" });
    expect(e.preventDefault).toHaveBeenCalled();
    expect(log).toEqual(["divider", "back"]);
    // once: the listeners are gone
    expect(divider.listeners()).toBe(0);
  });
  it("Shift+Tab, another key or focus leaving drops the redirect", () => {
    for (const ev of [{ key: "Tab", shiftKey: true }, { key: "ArrowDown" }]) {
      const log: string[] = [];
      const divider = stand("divider", log), back = stand("back", log);
      landDivider(divider as unknown as HTMLElement, back as unknown as HTMLElement);
      const e = divider.fire("keydown", ev);
      expect(e.preventDefault).not.toHaveBeenCalled();
      expect(log).toEqual(["divider"]);
      expect(divider.listeners()).toBe(0);
    }
    const log: string[] = [];
    const divider = stand("divider", log), back = stand("back", log);
    landDivider(divider as unknown as HTMLElement, back as unknown as HTMLElement);
    divider.fire("blur");
    expect(divider.listeners()).toBe(0);
  });
  it("without ← Review (not opened from the review) the divider takes focus and Tab is left alone", () => {
    const log: string[] = [];
    const divider = stand("divider", log);
    landDivider(divider as unknown as HTMLElement, null);
    expect(log).toEqual(["divider"]);
    expect(divider.listeners()).toBe(0);
  });
  it("← Review is found by its mark", () => {
    const q: string[] = [];
    reviewBackOf({ querySelector: ((s: string) => { q.push(s); return null; }) as Document["querySelector"] });
    expect(q).toEqual(["[data-review-back]"]);
  });
  it("a thread the feed does not list yet lands once it does (the ask just opened it)", () => {
    vi.useFakeTimers();
    const landed: string[] = [];
    const w = sentWatch({ land: (id) => landed.push(id), letGo: () => undefined });
    w.sent("01NEW");
    w.feed(["01OLD"]);
    expect(landed).toEqual([]);
    w.feed(["01OLD", "01NEW"]);
    expect(landed).toEqual(["01NEW"]);
    vi.useRealTimers();
  });
  const src = readFileSync(new URL("./Conversation.tsx", import.meta.url), "utf8") as string;
  it("the landing uses landDivider, asks the feed for an unlisted thread, and parks focus on ← Review, not the body", () => {
    expect(src).toContain("if (divider) landDivider(divider, reviewBackOf(document));");
    expect(src).toContain("unlisted.start(id, focus);");
    expect(src).toContain("if (document.activeElement === document.body || !document.activeElement) reviewBackOf(document)?.focus({ preventScroll: true });");
  });
});
