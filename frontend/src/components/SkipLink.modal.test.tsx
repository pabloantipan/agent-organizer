import { afterEach, describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { BACKDROP, MAIN_ID, SkipLink, openModal, tabIntoModal } from "./SkipLink";
import roleDrawerSrc from "./RoleDrawer.tsx?raw";
import cardDrawerSrc from "./CardDrawer.tsx?raw";
import retireSrc from "./Retire.tsx?raw";

// E6 (leftovers-24 FR-10, tab-reaches-links T7). No DOM library is a
// dependency here, so the document and elements are stand-ins with the few
// members SkipLink reads.
type Item = { attrs: Record<string, string>; focused?: boolean; tabIndex?: number; hasAttribute(n: string): boolean; focus(): void };
const item = (attrs: Record<string, string> = {}): Item => ({
  attrs, hasAttribute(n) { return n in this.attrs; }, focus() { this.focused = true; },
});
const modalOf = (items: Item[]) => ({ ...item(), querySelectorAll: () => items });
const docOf = (modal: ReturnType<typeof modalOf> | null, active: "body" | "html" | Item | null = "body") => {
  const body = {}, documentElement = {};
  return {
    body, documentElement,
    activeElement: active === "body" ? body : active === "html" ? documentElement : active,
    querySelector: (sel: string) => (sel === `${BACKDROP} .modal` ? modal : null),
  } as unknown as Document;
};
const tab = (shiftKey = false) => {
  const e = { key: "Tab", shiftKey, defaultPrevented: false, preventDefault() { this.defaultPrevented = true; } };
  return e;
};

const g = globalThis as { document?: unknown };
afterEach(() => { delete g.document; });

describe("E6: the skip link never sits under a drawer", () => {
  it("is rendered while no modal is open", () => {
    g.document = docOf(null);
    expect(renderToStaticMarkup(<SkipLink />)).toBe(`<a class="skip-link" href="#${MAIN_ID}">Skip to content</a>`);
  });

  it("is absent while a drawer is open", () => {
    g.document = docOf(modalOf([item()]));
    expect(renderToStaticMarkup(<SkipLink />)).toBe("");
  });

  it("counts every drawer and sheet over a backdrop as a modal", () => {
    for (const src of [roleDrawerSrc, cardDrawerSrc, retireSrc]) {
      expect(src).toMatch(/<div className="modal-backdrop".*\n\s*<div [^\n]*className=\{?[`"]modal /);
    }
    expect(openModal(docOf(null))).toBeNull();
  });

  it("Tab from body goes to the modal's first control, Shift+Tab to its last", () => {
    const first = item({ href: "#" }), off = item({ disabled: "" }), last = item();
    const modal = modalOf([first, last, off]);
    const e = tab();
    expect(tabIntoModal(e, docOf(modal))).toBe(first);
    expect(first.focused).toBe(true);
    expect(e.defaultPrevented).toBe(true);
    expect(tabIntoModal(tab(true), docOf(modal, "html"))).toBe(last);
  });

  it("a modal with no control takes the focus itself", () => {
    const modal = modalOf([]);
    expect(tabIntoModal(tab(), docOf(modal))).toBe(modal);
    expect(modal.tabIndex).toBe(-1);
  });

  it("leaves Tab alone when focus is somewhere, no modal is open, or the key is not Tab", () => {
    const inside = item();
    const modal = modalOf([item()]);
    expect(tabIntoModal(tab(), docOf(modal, inside))).toBeNull();
    expect(tabIntoModal(tab(), docOf(null))).toBeNull();
    const enter = { ...tab(), key: "Enter" };
    expect(tabIntoModal(enter, docOf(modal))).toBeNull();
    expect(enter.defaultPrevented).toBe(false);
  });
});
