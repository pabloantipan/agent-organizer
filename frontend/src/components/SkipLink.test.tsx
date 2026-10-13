import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { MAIN_ID, SkipLink, skipTarget, skipToContent } from "./SkipLink";
import appSrc from "../App.tsx?raw";
// @ts-expect-error node:fs has no type declarations in this tsconfig
import { readFileSync } from "node:fs";

// K2 (leftovers-22 FR-2). No DOM library is a dependency here, so elements
// are stand-ins with the few members skipTarget reads.
type Fake = {
  tagName: string; attrs: Record<string, string>; disabled?: boolean; inRail?: boolean; hidden?: boolean;
  tabIndex?: number; focused?: boolean;
};
const el = (f: Fake) => ({
  ...f,
  closest: (sel: string) => (sel === ".rail" && f.inRail ? {} : null),
  getAttribute: (n: string) => f.attrs[n] ?? null,
  hasAttribute: (n: string) => n in f.attrs || (n === "tabindex" && f.tabIndex !== undefined),
  getClientRects: () => (f.hidden ? [] : [{}]),
  focus() { this.focused = true; },
});
const mainOf = (kids: ReturnType<typeof el>[]) =>
  ({ tagName: "MAIN", querySelectorAll: () => kids, focus() { (this as { focused?: boolean }).focused = true; } }) as unknown as HTMLElement;

const shellCss = readFileSync(new URL("../styles/shell.css", import.meta.url), "utf8") as string;

describe("K2: Skip to content", () => {
  it("is a link to main named Skip to content", () => {
    expect(renderToStaticMarkup(<SkipLink />)).toBe(`<a class="skip-link" href="#${MAIN_ID}">Skip to content</a>`);
  });

  it("is the shell's first element, before the top bar, and every main is its target", () => {
    const shell = appSrc.slice(appSrc.indexOf('<div className="shell">'));
    expect(shell.indexOf("<SkipLink />")).toBeGreaterThan(0);
    expect(shell.indexOf("<SkipLink />")).toBeLessThan(shell.indexOf("<TopBar />"));
    const mains = appSrc.match(/<main [^>]*>/g) ?? [];
    expect(mains.length).toBe(4);
    for (const m of mains) expect(m).toContain("id={MAIN_ID} tabIndex={-1}");
  });

  it("lands past the rail on main's first heading or control", () => {
    const railBtn = el({ tagName: "BUTTON", attrs: {}, inRail: true });
    const row = el({ tagName: "BUTTON", attrs: { tabindex: "-1" } });
    const off = el({ tagName: "BUTTON", attrs: {}, disabled: true });
    const gone = el({ tagName: "A", attrs: { href: "#" }, hidden: true });
    const h2 = el({ tagName: "H2", attrs: { tabindex: "-1" } });
    const main = mainOf([railBtn, row, off, gone, h2]);
    expect(skipTarget(main)).toBe(h2);
  });

  it("falls back to main when nothing in it takes focus", () => {
    const main = mainOf([el({ tagName: "BUTTON", attrs: {}, inRail: true })]);
    expect(skipTarget(main)).toBe(main);
  });

  it("Enter's click moves focus, giving a bare heading tabindex -1", () => {
    const h1 = el({ tagName: "H1", attrs: {} });
    const main = mainOf([h1]);
    const doc = { getElementById: (id: string) => (id === MAIN_ID ? main : null) } as unknown as Document;
    expect(skipToContent(doc)).toBe(h1);
    expect(h1.focused).toBe(true);
    expect(h1.tabIndex).toBe(-1);
  });

  it("is hidden until focused, then shown with the ring over the bar", () => {
    expect(shellCss).toMatch(/\.skip-link \{[^}]*clip: rect\(0 0 0 0\)/);
    expect(shellCss).toMatch(/\.skip-link:focus \{[^}]*clip: auto;[^}]*z-index: calc\(var\(--z-topbar\) \+ 1\)/);
    expect(shellCss).toMatch(/\.skip-link:focus-visible \{ outline: 2px solid var\(--focus-ring\); outline-offset: 2px; \}/);
  });
});
