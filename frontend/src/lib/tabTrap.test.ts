import { afterEach, describe, expect, it } from "vitest";
import { loopTab, tabStops } from "./tabTrap";

// D1 (leftovers-25 FR-10). No DOM library is a dependency here, so the box
// and its controls are stand-ins with the few members the trap reads.
type El = { tagName: string; tabIndex: number; type?: string; name?: string; checked?: boolean; disabled?: boolean; shown?: boolean };
const g = globalThis as { document?: { activeElement: unknown } };
let active: unknown = null;
const el = (o: Partial<El> & { tagName?: string } = {}) => {
  const e = {
    tagName: "BUTTON", tabIndex: 0, shown: true, ...o,
    matches(sel: string) { return sel === ":disabled" && !!e.disabled; },
    getClientRects() { return e.shown ? [{}] : []; },
    focus() { active = e; },
  };
  return e;
};
const box = (els: ReturnType<typeof el>[]) => ({ querySelectorAll: () => els }) as unknown as HTMLElement;
const key = (k: string, shiftKey = false) => ({
  key: k, shiftKey, altKey: false, ctrlKey: false, metaKey: false, prevented: false,
  preventDefault() { this.prevented = true; }, stopPropagation() {},
});

afterEach(() => { delete g.document; active = null; });
const at = (a: unknown) => { active = a; g.document = { get activeElement() { return active; } }; };

describe("D1: the box keeps Tab", () => {
  const title = el({ tagName: "H2", tabIndex: -1 });
  const first = el(), mid = el({ tagName: "TEXTAREA" }), off = el({ disabled: true }), hidden = el({ shown: false }), last = el({ tagName: "A" });
  const root = box([first, mid, off, hidden, last]);

  it("counts enabled, shown, ordered controls only", () => {
    expect(tabStops(root)).toEqual([first, mid, last]);
    expect(tabStops(box([title]))).toEqual([]);
  });

  it("Tab past the last control goes to the first; Shift+Tab past the first to the last", () => {
    at(last); const e = key("Tab"); loopTab(e, root);
    expect(active).toBe(first); expect(e.prevented).toBe(true);
    at(first); loopTab(key("Tab", true), root);
    expect(active).toBe(last);
  });

  it("moves every Tab, so focus never leaves for body", () => {
    at(first); loopTab(key("Tab"), root); expect(active).toBe(mid);
    at(mid); loopTab(key("Tab", true), root); expect(active).toBe(first);
  });

  it("from the title, Tab goes to the first and Shift+Tab to the last", () => {
    at(title); loopTab(key("Tab"), root); expect(active).toBe(first);
    at(title); loopTab(key("Tab", true), root); expect(active).toBe(last);
  });

  it("a radio group is one stop: its checked radio", () => {
    const a = el({ tagName: "INPUT", type: "radio", name: "o" }), b = el({ tagName: "INPUT", type: "radio", name: "o", checked: true });
    const after = el();
    const r = box([a, b, after]);
    expect(tabStops(r)).toEqual([b, after]);
    at(a); loopTab(key("Tab"), r); expect(active).toBe(after);
  });

  it("leaves other keys and modified Tabs alone", () => {
    at(last);
    const e = key("ArrowDown"); loopTab(e, root); expect(e.prevented).toBe(false);
    const m = { ...key("Tab"), metaKey: true }; loopTab(m, root); expect(m.prevented).toBe(false);
    expect(active).toBe(last);
  });
});
